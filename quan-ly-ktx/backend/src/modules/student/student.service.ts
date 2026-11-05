import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Role } from '../../common/role.enum';
import { Contract } from '../contract/contract.entity';
import { Notification } from '../notification/notification.entity';
import { Room } from '../room/room.entity';
import { UtilityBill } from '../utility-bill/utility-bill.entity';
import { UtilityBillShare } from '../utility-bill/utility-bill-share.entity';
import { splitUtilityAmount } from '../meter-reading/meter-reading-calculations';
import { isPaged, likePattern, ListQueryDto, pageWindow, PagedResult } from '../../common/list-query.dto';
import { ApproveResidenceRequestDto } from './dto/approve-residence-request.dto';
import { ResidenceRequestDto } from './dto/residence-request.dto';
import { StudentProfileDto } from './dto/student-profile.dto';
import { ResidenceRequest, ResidenceRequestStatus } from './residence-request.entity';
import { Student } from './student.entity';

@Injectable()
export class StudentService {
  constructor(
    @Inject('STUDENT_REPOSITORY')
    private readonly studentRepository: Repository<Student>,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: ListQueryDto = {}): Promise<Student[] | PagedResult<Student>> {
    const builder = this.studentRepository.createQueryBuilder('student').orderBy('student.sid');
    if (query.q?.trim()) {
      builder.andWhere(
        '(student.sid LIKE :q OR student.sname LIKE :q OR student.email LIKE :q OR student.phone LIKE :q)',
        { q: likePattern(query.q) },
      );
    }
    if (!isPaged(query)) return builder.getMany();
    const { page, limit, skip } = pageWindow(query);
    const [items, total] = await builder.skip(skip).take(limit).getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOneBy({ sid: id });
    if (!student) throw new NotFoundException('Không tìm thấy sinh viên.');
    return student;
  }

  async create(studentData: Partial<Student>): Promise<Student> {
    // save() với khóa chính đã có sẽ ghi đè bản cũ nên phải kiểm tra trước.
    if (await this.studentRepository.existsBy({ sid: studentData.sid })) {
      throw new ConflictException('Mã sinh viên đã tồn tại.');
    }
    const newStudent = this.studentRepository.create(studentData);
    return this.studentRepository.save(newStudent);
  }

  async update(id: string, studentData: Partial<Student>): Promise<Student> {
    await this.findOne(id);
    if (Object.keys(studentData).length) await this.studentRepository.update(id, studentData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const student = await this.studentRepository.findOneBy({ sid: id });
    if (!student) throw new NotFoundException('Không tìm thấy sinh viên.');

    const activeContractCount = await this.dataSource.getRepository(Contract).createQueryBuilder('contract')
      .innerJoin('contract.student', 'student')
      .where('student.sid = :sid', { sid: id })
      .andWhere('contract.is_active = :isActive', { isActive: true })
      .andWhere('contract.end_date >= CURRENT_DATE()')
      .getCount();
    if (activeContractCount) {
      throw new ConflictException('Không thể xóa sinh viên còn hợp đồng lưu trú.');
    }

    const unpaidShare = await this.dataSource.getRepository(UtilityBillShare).findOne({
      where: { student: { sid: id }, isPaid: false },
      select: { id: true },
    });
    if (unpaidShare) {
      throw new ConflictException('Không thể xóa sinh viên còn hóa đơn chưa thanh toán.');
    }
    const paidShare = await this.dataSource.getRepository(UtilityBillShare).findOne({
      where: { student: { sid: id } },
      select: { id: true },
    });
    if (paidShare) {
      throw new ConflictException('Không thể xóa sinh viên đang được lưu trong lịch sử hóa đơn.');
    }

    const [contracts, unpaidBills] = await Promise.all([
      this.dataSource.getRepository(Contract).find({
        where: { student: { sid: id } },
        relations: { room: true },
      }),
      this.dataSource.getRepository(UtilityBill).find({
        where: { is_paid: false },
        relations: { room: true, shares: true },
      }),
    ]);
    const unpaidLegacyBill = unpaidBills.some((bill) => {
      if (!bill.room || bill.shares?.length) return false;
      const month = String(bill.month).padStart(2, '0');
      const cycleStart = `${bill.year}-${month}-01`;
      const cycleEnd = new Date(Date.UTC(bill.year, bill.month, 0)).toISOString().slice(0, 10);
      return contracts.some((contract) => (
        contract.room?.id === bill.room?.id
        && this.asDay(contract.start_date) <= cycleEnd
        && this.asDay(contract.end_date) >= cycleStart
      ));
    });
    if (unpaidLegacyBill) {
      throw new ConflictException('Không thể xóa sinh viên còn hóa đơn chưa thanh toán.');
    }
    if (contracts.length) {
      throw new ConflictException('Không thể xóa sinh viên đang được lưu trong lịch sử hợp đồng.');
    }

    await this.studentRepository.delete(id);
  }

  private asDay(value: string | Date): string {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value).slice(0, 10);
  }

  async saveMyProfile(userId: number, profile: StudentProfileDto) {
    await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const studentRepository = manager.getRepository(Student);
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('Không tìm thấy tài khoản.');
      if (user.studentSid && user.studentSid !== profile.sid) {
        throw new ConflictException('Mã sinh viên đã liên kết với tài khoản này và không thể thay đổi.');
      }

      const existingStudent = await studentRepository.findOneBy({ sid: profile.sid });
      if (existingStudent) {
        if (user.studentSid !== profile.sid) {
          throw new ConflictException('Mã sinh viên này đã có hồ sơ. Vui lòng liên hệ quản lý để được hỗ trợ.');
        }
        existingStudent.sname = profile.sname;
        existingStudent.email = profile.email;
        existingStudent.phone = profile.phone;
        await studentRepository.save(existingStudent);
      } else {
        await studentRepository.save(studentRepository.create({
          ...profile,
          role: Role.STUDENT,
        }));
      }

      if (!user.studentSid) {
        user.studentSid = profile.sid;
        await userRepository.save(user);
      }
    });
    return this.getPortalData(userId);
  }

  async requestResidence(userId: number, requestDto: ResidenceRequestDto) {
    const savedRequest = await this.dataSource.transaction(async (manager) => {
      const user = await manager.getRepository(User).findOne({
        where: { id: userId },
        select: { id: true, studentSid: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user?.studentSid) throw new BadRequestException('Hãy hoàn thiện hồ sơ cá nhân trước.');

      const requests = manager.getRepository(ResidenceRequest);
      const pending = await requests.findOne({
        where: { student: { sid: user.studentSid }, status: ResidenceRequestStatus.PENDING },
      });
      if (pending) throw new ConflictException('Bạn đã có yêu cầu lưu trú đang chờ duyệt.');

      const activeContract = await manager.getRepository(Contract).createQueryBuilder('contract')
        .innerJoin('contract.student', 'student')
        .where('student.sid = :sid', { sid: user.studentSid })
        .andWhere('contract.is_active = :active', { active: true })
        .andWhere('contract.start_date <= CURRENT_DATE()')
        .andWhere('contract.end_date >= CURRENT_DATE()')
        .getOne();
      if (activeContract) throw new ConflictException('Bạn đang có hợp đồng lưu trú còn hiệu lực.');

      const request = await requests.save(requests.create({
        student: { sid: user.studentSid },
        status: ResidenceRequestStatus.PENDING,
        note: requestDto.note?.trim() || null,
      }));

      const managers = await manager.getRepository(User).find({
        where: { role: In([Role.ADMIN, Role.MANAGER]) },
        select: { id: true },
      });
      if (managers.length) {
        const notificationRepository = manager.getRepository(Notification);
        await notificationRepository.save(managers.map((recipient) => notificationRepository.create({
          userId: recipient.id,
          title: 'Yêu cầu lưu trú mới',
          message: `${user.studentSid} đã gửi yêu cầu đăng ký lưu trú.`,
        })));
      }
      return request;
    });
    return {
      id: savedRequest.id,
      status: savedRequest.status,
      requestedAt: savedRequest.requestedAt,
    };
  }

  async listResidenceRequests() {
    return this.dataSource.getRepository(ResidenceRequest).find({
      relations: { student: true },
      order: { requestedAt: 'DESC' },
    });
  }

  async reviewResidenceRequest(
    requestId: number,
    managerId: number,
    decision: 'approve' | 'reject',
    details?: Partial<ApproveResidenceRequestDto> & { reviewNote?: string },
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const requestRepository = queryRunner.manager.getRepository(ResidenceRequest);
      const request = await requestRepository.findOne({
        where: { id: requestId },
        relations: { student: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!request) throw new NotFoundException('Không tìm thấy yêu cầu lưu trú.');
      if (request.status !== ResidenceRequestStatus.PENDING) {
        throw new ConflictException('Yêu cầu này đã được xử lý.');
      }

      request.reviewedBy = managerId;
      request.reviewedAt = new Date();
      request.reviewNote = details?.reviewNote?.trim() || null;

      let message: string;
      if (decision === 'approve') {
        if (!details?.roomId || !details.endDate || details.depositAmount === undefined) {
          throw new BadRequestException('Thiếu thông tin xếp phòng.');
        }
        const endDate = new Date(`${details.endDate}T23:59:59`);
        if (Number.isNaN(endDate.getTime()) || endDate <= new Date()) {
          throw new BadRequestException('Ngày kết thúc lưu trú phải nằm trong tương lai.');
        }

        const roomRepository = queryRunner.manager.getRepository(Room);
        const room = await roomRepository.findOne({
          where: { id: details.roomId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!room) throw new NotFoundException('Không tìm thấy phòng đã chọn.');

        const occupancy = await queryRunner.manager.getRepository(Contract).createQueryBuilder('contract')
          .innerJoin('contract.room', 'room')
          .where('room.id = :roomId', { roomId: room.id })
          .andWhere('contract.is_active = :active', { active: true })
          .andWhere('contract.start_date <= CURRENT_DATE()')
          .andWhere('contract.end_date >= CURRENT_DATE()')
          .getCount();
        if (occupancy >= room.maxCapacity) {
          throw new ConflictException('Phòng đã đủ sức chứa. Hãy chọn phòng khác.');
        }

        const startDate = new Date();
        const contract = queryRunner.manager.getRepository(Contract).create({
          student: request.student,
          room,
          start_date: startDate,
          end_date: endDate,
          deposit_amount: details.depositAmount,
          is_active: true,
        });
        await queryRunner.manager.save(contract);
        room.currentOccupancy = occupancy + 1;
        await roomRepository.save(room);
        request.status = ResidenceRequestStatus.APPROVED;
        message = `Yêu cầu lưu trú đã được duyệt. Bạn được xếp vào phòng ${room.roomNumber}, ${room.building}.`;
      } else {
        request.status = ResidenceRequestStatus.REJECTED;
        message = request.reviewNote
          ? `Yêu cầu lưu trú chưa được duyệt. Lý do: ${request.reviewNote}`
          : 'Yêu cầu lưu trú chưa được duyệt. Vui lòng liên hệ ban quản lý để biết thêm chi tiết.';
      }

      await requestRepository.save(request);
      const linkedUser = await queryRunner.manager.getRepository(User).findOne({
        where: { studentSid: request.student.sid },
      });
      if (linkedUser) {
        await queryRunner.manager.getRepository(Notification).save(
          queryRunner.manager.getRepository(Notification).create({
            userId: linkedUser.id,
            title: decision === 'approve' ? 'Yêu cầu lưu trú đã được duyệt' : 'Cập nhật yêu cầu lưu trú',
            message,
          }),
        );
      }

      await queryRunner.commitTransaction();
      const reviewedRequest = await requestRepository.findOne({
        where: { id: request.id },
        relations: { student: true },
      });
      return reviewedRequest;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getPortalData(userId: number) {
    const user = await this.dataSource.getRepository(User).findOne({
      where: { id: userId },
      select: { id: true, studentSid: true },
    });
    if (!user?.studentSid) {
      return { linked: false, student: null, room: null, roommates: [], bills: [], residenceRequest: null };
    }

    const student = await this.studentRepository.findOneBy({ sid: user.studentSid });
    if (!student) {
      return { linked: false, student: null, room: null, roommates: [], bills: [], residenceRequest: null };
    }

    const contractRepository = this.dataSource.getRepository(Contract);
    const activeContract = await contractRepository.createQueryBuilder('contract')
      .innerJoin('contract.student', 'student')
      .leftJoinAndSelect('contract.room', 'room')
      .where('student.sid = :sid', { sid: student.sid })
      .andWhere('contract.is_active = :isActive', { isActive: true })
      .andWhere('contract.start_date <= CURRENT_DATE()')
      .andWhere('contract.end_date >= CURRENT_DATE()')
      .orderBy('contract.start_date', 'DESC')
      .getOne();

    const room = activeContract?.room || null;
    let roommates: Array<{ sid: string; name: string; phone: string }> = [];
    let bills: UtilityBill[] = [];

    if (room) {
      roommates = await contractRepository.createQueryBuilder('contract')
        .innerJoin('contract.student', 'student')
        .innerJoin('contract.room', 'room')
        .where('room.id = :roomId', { roomId: room.id })
        .andWhere('contract.is_active = :isActive', { isActive: true })
        .andWhere('contract.start_date <= CURRENT_DATE()')
        .andWhere('contract.end_date >= CURRENT_DATE()')
        .andWhere('student.sid != :sid', { sid: student.sid })
        .select('student.sid', 'sid')
        .addSelect('student.sname', 'name')
        .addSelect('student.phone', 'phone')
        .orderBy('student.sname', 'ASC')
        .getRawMany();

      bills = await this.dataSource.getRepository(UtilityBill).createQueryBuilder('bill')
        .innerJoin('bill.room', 'room')
        .leftJoinAndSelect('bill.shares', 'share')
        .leftJoinAndSelect('share.student', 'billStudent')
        .where('room.id = :roomId', { roomId: room.id })
        .andWhere('bill.is_paid = :isPaid', { isPaid: false })
        .andWhere(
          '(share.id IS NULL OR (share.student_sid = :studentSid AND share.is_paid = :shareIsPaid))',
          { studentSid: student.sid, shareIsPaid: false },
        )
        .orderBy('bill.due_date', 'ASC')
        .getMany();
    }

    const residenceRequest = await this.dataSource.getRepository(ResidenceRequest).findOne({
      where: { student: { sid: student.sid } },
      order: { requestedAt: 'DESC' },
    });

    return {
      linked: true,
      student: { sid: student.sid, name: student.sname, email: student.email, phone: student.phone },
      room: room ? { id: room.id, roomNumber: room.roomNumber, building: room.building } : null,
      roommates,
      bills: bills.map((bill) => {
        const share = bill.shares?.find((item) => item.student.sid === student.sid);
        if (bill.shares?.length && !share) return null;
        const fallbackShare = splitUtilityAmount(
          Number(bill.total_amount),
          [student.sid, ...roommates.map((roommate) => roommate.sid)],
        ).find((item) => item.sid === student.sid);
        const fallbackRentShare = splitUtilityAmount(
          Number(bill.roomRentAmount || 0),
          [student.sid, ...roommates.map((roommate) => roommate.sid)],
        ).find((item) => item.sid === student.sid);
        const isPaid = share?.isPaid ?? bill.is_paid;
        return {
          bill_id: bill.bill_id,
          billType: bill.billType || 'UTILITY',
          title: bill.title,
          description: bill.description,
          hasReceiptImage: Boolean(bill.receiptImagePath),
          month: bill.month,
          year: bill.year,
          roomRentAmount: Number(share?.roomRentAmount ?? fallbackRentShare?.amount ?? 0),
          total_amount: Number(share?.amount ?? fallbackShare?.amount ?? bill.total_amount),
          dueDate: bill.dueDate,
          is_paid: isPaid,
        };
      }).filter((bill) => bill && !bill.is_paid),
      residenceRequest: residenceRequest ? {
        id: residenceRequest.id,
        status: residenceRequest.status,
        note: residenceRequest.note,
        reviewNote: residenceRequest.reviewNote,
        requestedAt: residenceRequest.requestedAt,
        reviewedAt: residenceRequest.reviewedAt,
      } : null,
    };
  }
}
