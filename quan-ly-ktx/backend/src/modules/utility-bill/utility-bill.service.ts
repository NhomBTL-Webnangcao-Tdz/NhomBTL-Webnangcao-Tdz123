import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, stat, unlink, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { DataSource, In, Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Role } from '../../common/role.enum';
import { Contract } from '../contract/contract.entity';
import { Notification } from '../notification/notification.entity';
import { Room } from '../room/room.entity';
import { CreateGeneralChargeDto } from './dto/create-general-charge.dto';
import { UtilityBill } from './utility-bill.entity';
import { UtilityBillShare } from './utility-bill-share.entity';
import { splitUtilityAmount } from '../meter-reading/meter-reading-calculations';

interface UploadedReceiptImage {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

const receiptImageTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);
const maxReceiptSize = 5 * 1024 * 1024;

@Injectable()
export class UtilityBillService {
  private readonly logger = new Logger(UtilityBillService.name);
  private readonly receiptDirectory = resolve(process.cwd(), 'storage', 'invoice-receipts');

  constructor(
    @Inject('UTILITY_BILL_REPOSITORY')
    private utilityBillRepository: Repository<UtilityBill>,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    const bills = await this.utilityBillRepository.find({
      relations: { room: true, shares: { student: true } },
    });
    return bills.map((bill) => this.serializeBill(bill));
  }

  async findOne(id: number) {
    const bill = await this.utilityBillRepository.findOne({
      where: { bill_id: id },
      relations: { room: true, shares: { student: true } },
    });
    return bill ? this.serializeBill(bill) : null;
  }

  async create(utilityBillData: Partial<UtilityBill>): Promise<UtilityBill> {
    const newBill = this.utilityBillRepository.create(utilityBillData);
    return this.utilityBillRepository.save(newBill);
  }

  private serializeBill(bill: UtilityBill) {
    return {
      bill_id: bill.bill_id,
      billType: bill.billType || 'UTILITY',
      title: bill.title,
      description: bill.description,
      hasReceiptImage: Boolean(bill.receiptImagePath),
      month: bill.month,
      year: bill.year,
      old_electric_index: bill.old_electric_index,
      new_electric_index: bill.new_electric_index,
      old_water_index: bill.old_water_index,
      new_water_index: bill.new_water_index,
      total_amount: Number(bill.total_amount),
      roomRentAmount: Number(bill.roomRentAmount || 0),
      electricUnitPrice: bill.electricUnitPrice,
      waterUnitPrice: bill.waterUnitPrice,
      is_paid: bill.is_paid,
      dueDate: bill.dueDate,
      room: bill.room ? {
        id: bill.room.id,
        building: bill.room.building,
        roomNumber: bill.room.roomNumber,
      } : null,
      shares: bill.shares?.map((share) => ({
        amount: Number(share.amount),
        roomRentAmount: Number(share.roomRentAmount || 0),
        isPaid: share.isPaid,
        student: {
          sid: share.student.sid,
          sname: share.student.sname,
          email: share.student.email,
          phone: share.student.phone,
        },
      })) || [],
    };
  }

  private validateReceiptImage(image: UploadedReceiptImage | undefined): asserts image is UploadedReceiptImage {
    if (!image || !receiptImageTypes.has(image.mimetype) || image.size > maxReceiptSize) {
      throw new BadRequestException('Ảnh hóa đơn phải là JPG, PNG hoặc WEBP và không vượt quá 5 MB.');
    }
    const signatureMatches = image.mimetype === 'image/jpeg'
      ? image.buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))
      : image.mimetype === 'image/png'
        ? image.buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
        : image.buffer.subarray(0, 4).toString() === 'RIFF'
          && image.buffer.subarray(8, 12).toString() === 'WEBP';
    if (!signatureMatches) throw new BadRequestException('Nội dung ảnh hóa đơn không hợp lệ.');
  }

  async createGeneralCharge(details: CreateGeneralChargeDto, image?: UploadedReceiptImage) {
    if (image) this.validateReceiptImage(image);
    const receiptPath = image ? await this.storeReceiptImage(image) : null;
    const queryRunner = this.dataSource.createQueryRunner();
    let connected = false;
    let transactionStarted = false;
    let saved = false;
    try {
      await queryRunner.connect();
      connected = true;
      await queryRunner.startTransaction();
      transactionStarted = true;
      const room = await queryRunner.manager.getRepository(Room).findOne({
        where: { id: details.roomId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!room) throw new NotFoundException('Không tìm thấy phòng đã chọn.');

      const contracts = await queryRunner.manager.getRepository(Contract)
        .createQueryBuilder('contract')
        .innerJoinAndSelect('contract.student', 'student')
        .where('contract.room_id = :roomId', { roomId: room.id })
        .andWhere('contract.is_active = :active', { active: true })
        .andWhere('contract.start_date <= CURRENT_DATE()')
        .andWhere('contract.end_date >= CURRENT_DATE()')
        .getMany();
      const studentSids = [...new Set(contracts.map((contract) => contract.student.sid))];
      if (!studentSids.length) {
        throw new ConflictException('Phòng này chưa có sinh viên đang lưu trú để nhận hóa đơn.');
      }

      const totalAmount = Number(details.totalAmount);
      const billRepository = queryRunner.manager.getRepository(UtilityBill);
      const bill = await billRepository.save(billRepository.create({
        billType: 'GENERAL',
        title: details.title.trim(),
        description: details.description?.trim() || null,
        receiptImagePath: receiptPath,
        room,
        month: details.month,
        year: details.year,
        old_electric_index: 0,
        new_electric_index: 0,
        old_water_index: 0,
        new_water_index: 0,
        total_amount: totalAmount,
        roomRentAmount: 0,
        electricUnitPrice: null,
        waterUnitPrice: null,
        is_paid: false,
        dueDate: new Date(`${details.dueDate}T12:00:00`),
      }));

      const shares = splitUtilityAmount(totalAmount, studentSids);
      const shareRepository = queryRunner.manager.getRepository(UtilityBillShare);
      await shareRepository.save(shares.map((share) => shareRepository.create({
        bill,
        student: { sid: share.sid },
        amount: share.amount,
        roomRentAmount: 0,
        isPaid: false,
      })));

      const users = await queryRunner.manager.getRepository(User).find({
        where: { studentSid: In(studentSids) },
        select: { id: true, studentSid: true },
      });
      if (users.length) {
        const notificationRepository = queryRunner.manager.getRepository(Notification);
        const amountBySid = new Map(shares.map((share) => [share.sid, share.amount]));
        await notificationRepository.save(users.map((user) => notificationRepository.create({
          userId: user.id,
          title: 'Hóa đơn mới',
          message: `${details.title.trim()} · kỳ ${details.month}/${details.year}: phần của bạn ${Number(amountBySid.get(user.studentSid ?? '') ?? 0).toLocaleString('vi-VN')} ₫. Hạn thanh toán ${details.dueDate.split('-').reverse().join('/')}.`,
        })));
      }
      await queryRunner.commitTransaction();
      transactionStarted = false;
      saved = true;
      return this.findOne(bill.bill_id);
    } catch (error) {
      if (transactionStarted) await queryRunner.rollbackTransaction();
      if (receiptPath && !saved) {
        try {
          await unlink(receiptPath);
        } catch (cleanupError) {
          this.logger.error('Failed to remove an uncommitted invoice receipt image.', cleanupError);
        }
      }
      throw error;
    } finally {
      if (connected) await queryRunner.release();
    }
  }

  private async storeReceiptImage(image: UploadedReceiptImage): Promise<string> {
    const extension = receiptImageTypes.get(image.mimetype);
    if (!extension) throw new BadRequestException('Định dạng ảnh hóa đơn không hợp lệ.');
    await mkdir(this.receiptDirectory, { recursive: true });
    const destination = resolve(this.receiptDirectory, `${randomUUID()}${extension}`);
    await writeFile(destination, image.buffer, { flag: 'wx', mode: 0o600 });
    return destination;
  }

  async getReceiptImage(billId: number, userId: number, role: Role) {
    const bill = await this.utilityBillRepository.findOne({
      where: { bill_id: billId },
      relations: { shares: { student: true } },
    });
    if (!bill?.receiptImagePath) throw new NotFoundException('Hóa đơn không có ảnh đính kèm.');
    if (role === Role.STUDENT) {
      const user = await this.dataSource.getRepository(User).findOne({
        where: { id: userId },
        select: { id: true, studentSid: true },
      });
      if (!user?.studentSid || !bill.shares?.some((share) => share.student.sid === user.studentSid)) {
        throw new ForbiddenException('Bạn không có quyền xem ảnh hóa đơn này.');
      }
    }
    if (!resolve(bill.receiptImagePath).startsWith(`${this.receiptDirectory}/`)) {
      throw new NotFoundException('Không tìm thấy ảnh hóa đơn.');
    }
    try {
      const fileStat = await stat(bill.receiptImagePath);
      if (!fileStat.isFile()) throw new NotFoundException('Không tìm thấy ảnh hóa đơn.');
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
        throw new NotFoundException('Không tìm thấy ảnh hóa đơn.');
      }
      throw error;
    }
    const extension = extname(bill.receiptImagePath);
    const mimeType = extension === '.png' ? 'image/png' : extension === '.webp' ? 'image/webp' : 'image/jpeg';
    return { stream: createReadStream(bill.receiptImagePath), mimeType };
  }

  async update(id: number, utilityBillData: Partial<UtilityBill>) {
    const bill = await this.utilityBillRepository.findOneBy({ bill_id: id });
    if (!bill) return null;
    Object.assign(bill, utilityBillData);
    await this.utilityBillRepository.save(bill);
    if (utilityBillData.is_paid !== undefined) {
      const shares = await this.dataSource.getRepository(UtilityBillShare).find({
        where: { bill: { bill_id: id } },
      });
      if (shares.length) {
        await this.dataSource.getRepository(UtilityBillShare).save(
          shares.map((share) => ({ ...share, isPaid: utilityBillData.is_paid })),
        );
      }
    }
    return this.findOne(id);
  }

  async updateSharePayment(billId: number, studentSid: string, isPaid: boolean) {
    if (typeof isPaid !== 'boolean') {
      throw new BadRequestException('Trạng thái thanh toán không hợp lệ.');
    }

    await this.dataSource.transaction(async (manager) => {
      const shares = manager.getRepository(UtilityBillShare);
      const share = await shares.findOne({
        where: { bill: { bill_id: billId }, student: { sid: studentSid } },
        relations: { bill: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!share) throw new NotFoundException('Không tìm thấy phần hóa đơn của sinh viên.');

      share.isPaid = isPaid;
      await shares.save(share);
      const unpaidCount = await shares.count({
        where: { bill: { bill_id: billId }, isPaid: false },
      });
      share.bill.is_paid = unpaidCount === 0;
      await manager.getRepository(UtilityBill).save(share.bill);
    });

    return this.findOne(billId);
  }

  async remindStudent(billId: number, studentSid: string) {
    const bill = await this.utilityBillRepository.findOne({
      where: { bill_id: billId },
      relations: { room: true, shares: { student: true } },
    });
    if (!bill) throw new NotFoundException('Không tìm thấy hóa đơn.');
    const share = bill.shares?.find((item) => item.student.sid === studentSid);
    if (!share) throw new NotFoundException('Không tìm thấy phần hóa đơn của sinh viên.');
    if (share.isPaid) throw new BadRequestException('Sinh viên này đã thanh toán phần hóa đơn.');

    const dueDay = bill.dueDate instanceof Date
      ? [
        bill.dueDate.getFullYear(),
        String(bill.dueDate.getMonth() + 1).padStart(2, '0'),
        String(bill.dueDate.getDate()).padStart(2, '0'),
      ].join('-')
      : String(bill.dueDate).slice(0, 10);
    const today = new Date();
    const todayDay = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
    if (!bill.dueDate || todayDay <= dueDay) {
      throw new BadRequestException('Chỉ có thể nhắc thanh toán sau khi hóa đơn quá hạn.');
    }

    const user = await this.dataSource.getRepository(User).findOneBy({ studentSid });
    if (!user) throw new NotFoundException('Sinh viên chưa liên kết tài khoản nhận thông báo.');
    const dueDateLabel = dueDay.split('-').reverse().join('/');
    const notification = this.dataSource.getRepository(Notification).create({
      userId: user.id,
      title: 'Nhắc thanh toán hóa đơn quá hạn',
      message: `${bill.billType === 'GENERAL' ? bill.title : `Hóa đơn điện nước kỳ ${bill.month}/${bill.year}`} phòng ${bill.room?.roomNumber || ''} còn ${Number(share.amount).toLocaleString('vi-VN')} ₫ chưa thanh toán. Hạn chót là ${dueDateLabel}. Vui lòng liên hệ quản lý nếu cần hỗ trợ.`,
    });
    await this.dataSource.getRepository(Notification).save(notification);
    return { sent: true };
  }

  async remove(id: number): Promise<void> {
    await this.utilityBillRepository.delete(id);
  }
}