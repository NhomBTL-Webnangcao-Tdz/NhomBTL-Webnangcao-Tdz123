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
import { UtilityBill } from '../utility-bill/utility-bill.entity';
import { UtilityBillShare } from '../utility-bill/utility-bill-share.entity';
import { UtilityTariff } from '../utility-bill/utility-tariff.entity';
import { ReviewMeterReadingDto } from './dto/review-meter-reading.dto';
import { SubmitMeterReadingDto } from './dto/submit-meter-reading.dto';
import {
  calculateMonthlyBillAmount,
  calculateUtilityAmount,
  getNextMonthPaymentDate,
  splitUtilityAmount,
} from './meter-reading-calculations';
import { MeterReadingStatus, MeterReadingSubmission } from './meter-reading.entity';

type MeterKind = 'electric' | 'water';
interface UploadedMeterImage {
  buffer: Buffer;
  mimetype: string;
  size: number;
}
type UploadedMeterPhotos = Record<MeterKind, UploadedMeterImage | undefined>;

const imageMimeTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);
const maxImageSize = 5 * 1024 * 1024;

@Injectable()
export class MeterReadingService {
  private readonly logger = new Logger(MeterReadingService.name);
  private readonly submissions: Repository<MeterReadingSubmission>;
  private readonly storageDirectory = resolve(process.cwd(), 'storage', 'meter-readings');

  constructor(
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
  ) {
    this.submissions = dataSource.getRepository(MeterReadingSubmission);
  }

  private async findCurrentRoom(userId: number): Promise<Room | null> {
    const contract = await this.dataSource.getRepository(Contract).createQueryBuilder('contract')
      .innerJoin('contract.student', 'student')
      .leftJoinAndSelect('contract.room', 'room')
      .innerJoin(User, 'user', 'user.student_sid = student.sid')
      .where('user.id = :userId', { userId })
      .andWhere('contract.is_active = :active', { active: true })
      .andWhere('contract.start_date <= CURRENT_DATE()')
      .andWhere('contract.end_date >= CURRENT_DATE()')
      .orderBy('contract.start_date', 'DESC')
      .getOne();
    return contract?.room || null;
  }

  private async getCurrentRoom(userId: number): Promise<Room> {
    const room = await this.findCurrentRoom(userId);
    if (!room) throw new BadRequestException('Bạn chưa được xếp vào phòng lưu trú còn hiệu lực.');
    return room;
  }

  private getCurrentPeriod() {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear(), today: now };
  }

  private getDeadlineDate(year: number, month: number): Date {
    return new Date(year, month, 0, 23, 59, 59, 999);
  }

  private serializeSubmission(submission: MeterReadingSubmission | null) {
    if (!submission) return null;
    return {
      id: submission.id,
      room: submission.room ? {
        id: submission.room.id,
        building: submission.room.building,
        roomNumber: submission.room.roomNumber,
      } : null,
      submittedBy: submission.submittedBy,
      month: submission.month,
      year: submission.year,
      electricReading: submission.electricReading,
      waterReading: submission.waterReading,
      status: submission.status,
      reviewedAt: submission.reviewedAt,
      reviewNote: submission.reviewNote,
      createdAt: submission.createdAt,
    };
  }

  async getCurrentForStudent(userId: number) {
    const room = await this.findCurrentRoom(userId);
    const { month, year, today } = this.getCurrentPeriod();
    if (!room) {
      const tariff = await this.dataSource.getRepository(UtilityTariff).findOneBy({ id: 1 });
      return {
        room: null,
        month,
        year,
        deadline: this.getDeadlineDate(year, month),
        canSubmit: false,
        submission: null,
        tariff: tariff ? {
          electricPrice: Number(tariff.electricPrice),
          waterPrice: Number(tariff.waterPrice),
        } : null,
      };
    }
    const submission = await this.submissions.findOne({
      where: { room: { id: room.id }, month, year },
      relations: { room: true },
      order: { createdAt: 'DESC' },
    });
    const tariff = await this.dataSource.getRepository(UtilityTariff).findOneBy({ id: 1 });
    return {
      room: { id: room.id, building: room.building, roomNumber: room.roomNumber },
      month,
      year,
      deadline: this.getDeadlineDate(year, month),
      canSubmit: today <= this.getDeadlineDate(year, month)
        && (!submission || submission.status === MeterReadingStatus.REJECTED),
      submission: this.serializeSubmission(submission),
      tariff: tariff ? {
        electricPrice: Number(tariff.electricPrice),
        waterPrice: Number(tariff.waterPrice),
      } : null,
    };
  }

  private validatePhoto(photo: UploadedMeterImage | undefined): asserts photo is UploadedMeterImage {
    if (!photo) throw new BadRequestException('Cần tải lên đủ ảnh công tơ điện và công tơ nước.');
    const extension = imageMimeTypes.get(photo.mimetype);
    if (!extension || photo.size > maxImageSize) {
      throw new BadRequestException('Ảnh phải là JPG, PNG hoặc WEBP và không vượt quá 5 MB.');
    }
    const signatureMatches = photo.mimetype === 'image/jpeg'
      ? photo.buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))
      : photo.mimetype === 'image/png'
        ? photo.buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
        : photo.buffer.subarray(0, 4).toString() === 'RIFF'
          && photo.buffer.subarray(8, 12).toString() === 'WEBP';
    if (!signatureMatches) throw new BadRequestException('Định dạng ảnh không hợp lệ.');
  }

  async submit(
    userId: number,
    details: SubmitMeterReadingDto,
    photos: UploadedMeterPhotos,
  ) {
    this.validatePhoto(photos.electric);
    this.validatePhoto(photos.water);
    if (!Number.isSafeInteger(details.electricReading) || !Number.isSafeInteger(details.waterReading)) {
      throw new BadRequestException('Chỉ số điện và nước phải là số nguyên hợp lệ.');
    }
    const room = await this.getCurrentRoom(userId);
    const { month, year, today } = this.getCurrentPeriod();
    if (today > this.getDeadlineDate(year, month)) {
      throw new BadRequestException('Đã quá hạn gửi chỉ số của kỳ này.');
    }

    const storedFiles: string[] = [];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.getRepository(Room).findOne({
        where: { id: room.id },
        lock: { mode: 'pessimistic_write' },
      });
      const activeSubmission = await queryRunner.manager.getRepository(MeterReadingSubmission).findOne({
        where: {
          room: { id: room.id },
          month,
          year,
          status: In([MeterReadingStatus.PENDING, MeterReadingStatus.APPROVED]),
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (activeSubmission) {
        throw new ConflictException('Một sinh viên cùng phòng đã gửi chỉ số kỳ này.');
      }

      await mkdir(this.storageDirectory, { recursive: true });
      const electricPath = await this.storePhoto(photos.electric);
      storedFiles.push(electricPath);
      const waterPath = await this.storePhoto(photos.water);
      storedFiles.push(waterPath);

      const submissionRepository = queryRunner.manager.getRepository(MeterReadingSubmission);
      const submission = await submissionRepository.save(submissionRepository.create({
        room,
        submittedBy: userId,
        month,
        year,
        electricPhotoPath: electricPath,
        waterPhotoPath: waterPath,
        electricReading: details.electricReading,
        waterReading: details.waterReading,
        status: MeterReadingStatus.PENDING,
        reviewedBy: null,
        reviewedAt: null,
        reviewNote: null,
      }));
      const managers = await queryRunner.manager.getRepository(User).find({
        where: { role: In([Role.ADMIN, Role.MANAGER]) },
        select: { id: true },
      });
      if (managers.length) {
        const notificationRepository = queryRunner.manager.getRepository(Notification);
        await notificationRepository.save(managers.map((manager) => notificationRepository.create({
          userId: manager.id,
          title: 'Chỉ số điện nước cần xác nhận',
          message: `Tòa ${room.building}, phòng ${room.roomNumber} đã gửi chỉ số ${month}/${year}.`,
        })));
      }
      await queryRunner.commitTransaction();
      return this.serializeSubmission({ ...submission, room });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const cleanupResults = await Promise.allSettled(storedFiles.map((path) => unlink(path)));
      cleanupResults.forEach((result) => {
        if (result.status === 'rejected') this.logger.error('Failed to remove an uncommitted meter-reading image.', result.reason);
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async storePhoto(photo: UploadedMeterImage): Promise<string> {
    const extension = imageMimeTypes.get(photo.mimetype);
    if (!extension) throw new BadRequestException('Định dạng ảnh không hợp lệ.');
    const destination = resolve(this.storageDirectory, `${randomUUID()}${extension}`);
    await writeFile(destination, photo.buffer, { flag: 'wx', mode: 0o600 });
    return destination;
  }

  async listForManagers() {
    const submissions = await this.submissions.find({
      relations: { room: true },
      order: { createdAt: 'DESC' },
    });
    return submissions.map((submission) => this.serializeSubmission(submission));
  }

  async getPhoto(userId: number, role: Role, submissionId: number, meter: MeterKind) {
    if (meter !== 'electric' && meter !== 'water') throw new NotFoundException('Không tìm thấy ảnh công tơ.');
    const submission = await this.submissions.findOne({
      where: { id: submissionId },
      relations: { room: true },
    });
    if (!submission) throw new NotFoundException('Không tìm thấy bản gửi chỉ số.');
    if (role === Role.STUDENT && submission.submittedBy !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem ảnh của bản gửi này.');
    }
    const filePath = meter === 'electric' ? submission.electricPhotoPath : submission.waterPhotoPath;
    if (resolve(filePath).startsWith(`${this.storageDirectory}/`) === false) {
      throw new NotFoundException('Không tìm thấy ảnh công tơ.');
    }
    try {
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) throw new NotFoundException('Không tìm thấy ảnh công tơ.');
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
        throw new NotFoundException('Không tìm thấy ảnh công tơ.');
      }
      throw error;
    }
    const extension = extname(filePath);
    const mimeType = extension === '.png' ? 'image/png' : extension === '.webp' ? 'image/webp' : 'image/jpeg';
    return { stream: createReadStream(filePath), mimeType };
  }

  async review(
    submissionId: number,
    reviewerId: number,
    details: ReviewMeterReadingDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const submissions = queryRunner.manager.getRepository(MeterReadingSubmission);
      const submission = await submissions.findOne({
        where: { id: submissionId },
        relations: { room: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!submission) throw new NotFoundException('Không tìm thấy bản gửi chỉ số.');
      if (submission.status !== MeterReadingStatus.PENDING) {
        throw new ConflictException('Bản gửi chỉ số này đã được xử lý.');
      }
      const electricReading = details.electricReading ?? submission.electricReading;
      const waterReading = details.waterReading ?? submission.waterReading;
      if (!Number.isSafeInteger(electricReading) || !Number.isSafeInteger(waterReading)) {
        throw new BadRequestException('Chỉ số công tơ phải là số nguyên hợp lệ.');
      }

      submission.reviewedBy = reviewerId;
      submission.reviewedAt = new Date();
      submission.reviewNote = details.reviewNote?.trim() || null;
      const activeRoomContracts = await queryRunner.manager.getRepository(Contract)
        .createQueryBuilder('contract')
        .innerJoinAndSelect('contract.student', 'student')
        .where('contract.room_id = :roomId', { roomId: submission.room.id })
        .andWhere('contract.is_active = :active', { active: true })
        .andWhere('contract.start_date <= CURRENT_DATE()')
        .andWhere('contract.end_date >= CURRENT_DATE()')
        .getMany();
      const studentSids = [...new Set(activeRoomContracts.map((contract) => contract.student.sid))];
      let shares: ReturnType<typeof splitUtilityAmount> = [];
      let message: string;

      if (details.status === 'APPROVED') {
        const previousBill = await queryRunner.manager.getRepository(UtilityBill)
          .createQueryBuilder('bill')
          .where('bill.room_id = :roomId', { roomId: submission.room.id })
          .andWhere('(bill.bill_type IS NULL OR bill.bill_type = :billType)', { billType: 'UTILITY' })
          .andWhere('(bill.year < :year OR (bill.year = :year AND bill.month < :month))', {
            year: submission.year,
            month: submission.month,
          })
          .orderBy('bill.year', 'DESC')
          .addOrderBy('bill.month', 'DESC')
          .getOne();
        const oldElectricReading = previousBill?.new_electric_index ?? electricReading;
        const oldWaterReading = previousBill?.new_water_index ?? waterReading;
        if (electricReading < oldElectricReading || waterReading < oldWaterReading) {
          throw new BadRequestException('Chỉ số mới không được nhỏ hơn kỳ hóa đơn trước.');
        }

        const duplicateBill = await queryRunner.manager.getRepository(UtilityBill)
          .createQueryBuilder('bill')
          .where('bill.room_id = :roomId', { roomId: submission.room.id })
          .andWhere('bill.month = :month AND bill.year = :year', {
            month: submission.month,
            year: submission.year,
          })
          .andWhere('(bill.bill_type IS NULL OR bill.bill_type = :billType)', { billType: 'UTILITY' })
          .getOne();
        if (duplicateBill) throw new ConflictException('Phòng này đã có hóa đơn cho kỳ đó.');

        const tariff = await queryRunner.manager.getRepository(UtilityTariff).findOneBy({ id: 1 });
        if (!tariff) throw new ConflictException('Chưa cấu hình giá điện và nước.');
        const electricUnitPrice = Number(tariff.electricPrice);
        const waterUnitPrice = Number(tariff.waterPrice);
        const utilityAmount = calculateUtilityAmount(
          oldElectricReading,
          electricReading,
          oldWaterReading,
          waterReading,
          electricUnitPrice,
          waterUnitPrice,
        );
        const roomRentAmount = Number(submission.room.price);
        if (!Number.isFinite(roomRentAmount) || roomRentAmount < 0) {
          throw new ConflictException('Chưa cấu hình giá phòng hợp lệ.');
        }
        const totalAmount = calculateMonthlyBillAmount(utilityAmount, roomRentAmount);
        const dueDate = getNextMonthPaymentDate(submission.year, submission.month);

        const bills = queryRunner.manager.getRepository(UtilityBill);
        const bill = await bills.save(bills.create({
          room: submission.room,
          month: submission.month,
          year: submission.year,
          old_electric_index: oldElectricReading,
          new_electric_index: electricReading,
          old_water_index: oldWaterReading,
          new_water_index: waterReading,
          electricUnitPrice,
          waterUnitPrice,
          total_amount: totalAmount,
          roomRentAmount,
          is_paid: false,
          dueDate,
        }));
        shares = splitUtilityAmount(totalAmount, studentSids);
        const rentShares = new Map(
          splitUtilityAmount(roomRentAmount, studentSids)
            .map((share) => [share.sid, share.amount]),
        );
        if (shares.length) {
          const shareRepository = queryRunner.manager.getRepository(UtilityBillShare);
          await shareRepository.save(shares.map((share) => shareRepository.create({
            bill,
            student: { sid: share.sid },
            amount: share.amount,
            roomRentAmount: rentShares.get(share.sid) ?? 0,
            isPaid: false,
          })));
        }
        submission.electricReading = electricReading;
        submission.waterReading = waterReading;
        submission.status = MeterReadingStatus.APPROVED;
        message = `Hóa đơn tiền phòng và điện nước kỳ ${submission.month}/${submission.year} đã được tạo. Hạn thanh toán: ngày 10 tháng kế tiếp.`;
      } else {
        submission.status = MeterReadingStatus.REJECTED;
        message = submission.reviewNote
          ? `Chỉ số điện nước bị yêu cầu gửi lại. Lý do: ${submission.reviewNote}`
          : 'Chỉ số điện nước cần được gửi lại. Vui lòng chụp ảnh rõ hơn.';
      }

      await submissions.save(submission);
      const recipients = studentSids.length
        ? await queryRunner.manager.getRepository(User).find({
          where: { studentSid: In(studentSids) },
          select: { id: true, studentSid: true },
        })
        : [];
      if (recipients.length) {
        const notifications = queryRunner.manager.getRepository(Notification);
        const shareBySid = new Map(shares.map((share) => [share.sid, share.amount]));
        await notifications.save(recipients.map((recipient) => notifications.create({
          userId: recipient.id,
          title: details.status === 'APPROVED' ? 'Hóa đơn tiền phòng và điện nước đã tạo' : 'Cần gửi lại chỉ số điện nước',
          message: details.status === 'APPROVED'
            ? `${message} Phần của bạn: ${Number(shareBySid.get(recipient.studentSid ?? '') ?? 0).toLocaleString('vi-VN')} ₫.`
            : message,
        })));
      }

      await queryRunner.commitTransaction();
      return this.serializeSubmission(submission);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
