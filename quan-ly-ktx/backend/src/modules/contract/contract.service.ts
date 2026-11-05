import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Payment } from '../payment/payment.entity';
import { Room } from '../room/room.entity';
import { Student } from '../student/student.entity';
import { Contract } from './contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { LiquidateContractDto } from './dto/liquidate-contract.dto';
import { RenewContractDto } from './dto/renew-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractService {
  constructor(
    @Inject('CONTRACT_REPOSITORY')
    private readonly contractRepository: Repository<Contract>,
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Contract[]> {
    return this.contractRepository.find({ relations: { student: true, room: true } });
  }

  async findOne(id: number): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { contract_id: id },
      relations: { student: true, room: true },
    });
    if (!contract) throw new NotFoundException('Không tìm thấy hợp đồng.');
    return contract;
  }

  async create(contractData: CreateContractDto): Promise<Contract> {
    const contractId = await this.dataSource.transaction(async (manager) => {
      const studentRepository = manager.getRepository(Student);
      const student = await studentRepository.findOne({
        where: { sid: contractData.student.sid },
        lock: { mode: 'pessimistic_write' },
      });
      if (!student) throw new NotFoundException('Không tìm thấy sinh viên.');

      const startDate = this.asDay(contractData.start_date);
      const endDate = this.asDay(contractData.end_date);
      this.assertValidTerm(startDate, endDate);

      const isActive = contractData.is_active ?? true;
      const contractRepository = manager.getRepository(Contract);
      if (isActive) {
        await this.assertNoStudentOverlap(
          contractRepository,
          student.sid,
          startDate,
          endDate,
        );
      }

      let room: Room | null = null;
      if (contractData.room?.id) {
        room = await manager.getRepository(Room).findOne({
          where: { id: contractData.room.id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!room) throw new NotFoundException('Không tìm thấy phòng.');
        if (isActive && room.isMaintenance) {
          throw new ConflictException('Không thể xếp hợp đồng mới vào phòng đang bảo trì.');
        }
        if (isActive) {
          await this.assertRoomHasCapacity(
            contractRepository,
            room,
            startDate,
            endDate,
          );
        }
      }

      const contract = contractRepository.create({
        student,
        room,
        start_date: this.fromDay(startDate),
        end_date: this.fromDay(endDate),
        deposit_amount: contractData.deposit_amount,
        is_active: isActive,
      });
      const savedContract = await contractRepository.save(contract);
      if (room) await this.refreshRoomOccupancy(manager, room.id);
      return savedContract.contract_id;
    });

    return this.findOne(contractId);
  }

  async update(id: number, contractData: UpdateContractDto): Promise<Contract> {
    await this.dataSource.transaction(async (manager) => {
      const contractRepository = manager.getRepository(Contract);
      const contract = await contractRepository.findOne({
        where: { contract_id: id },
        relations: { student: true, room: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!contract) throw new NotFoundException('Không tìm thấy hợp đồng.');

      const studentSid = contractData.student?.sid || contract.student.sid;
      const student = await manager.getRepository(Student).findOne({
        where: { sid: studentSid },
        lock: { mode: 'pessimistic_write' },
      });
      if (!student) throw new NotFoundException('Không tìm thấy sinh viên.');

      const startDate = this.asDay(contractData.start_date ?? contract.start_date);
      const endDate = this.asDay(contractData.end_date ?? contract.end_date);
      const isActive = contractData.is_active ?? contract.is_active;
      this.assertValidTerm(startDate, endDate);

      const roomId = contractData.room === undefined
        ? contract.room?.id ?? null
        : contractData.room?.id ?? null;
      let room: Room | null = null;
      if (roomId) {
        room = await manager.getRepository(Room).findOne({
          where: { id: roomId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!room) throw new NotFoundException('Không tìm thấy phòng.');
        if (isActive && room.isMaintenance && room.id !== contract.room?.id) {
          throw new ConflictException('Không thể chuyển hợp đồng vào phòng đang bảo trì.');
        }
      }

      if (isActive) {
        await this.assertNoStudentOverlap(
          contractRepository,
          student.sid,
          startDate,
          endDate,
          id,
        );
        if (room) {
          await this.assertRoomHasCapacity(
            contractRepository,
            room,
            startDate,
            endDate,
            id,
          );
        }
      }

      const previousRoomId = contract.room?.id;
      contract.student = student;
      contract.room = room;
      contract.start_date = this.fromDay(startDate);
      contract.end_date = this.fromDay(endDate);
      contract.is_active = isActive;
      if (contractData.deposit_amount !== undefined) {
        contract.deposit_amount = contractData.deposit_amount;
      }
      await contractRepository.save(contract);

      if (previousRoomId && previousRoomId !== room?.id) {
        await this.refreshRoomOccupancy(manager, previousRoomId);
      }
      if (room) await this.refreshRoomOccupancy(manager, room.id);
    });
    return this.findOne(id);
  }

  async terminate(id: number): Promise<Contract> {
    await this.dataSource.transaction(async (manager) => {
      const contract = await this.lockContract(manager, id);
      if (!contract.is_active) throw new ConflictException('Hợp đồng đã kết thúc.');
      contract.is_active = false;
      await manager.getRepository(Contract).save(contract);
      if (contract.room) await this.refreshRoomOccupancy(manager, contract.room.id);
    });
    return this.findOne(id);
  }

  async renew(id: number, details: RenewContractDto): Promise<Contract> {
    await this.dataSource.transaction(async (manager) => {
      const contract = await this.lockContract(manager, id);
      if (!contract.is_active) throw new ConflictException('Không thể gia hạn hợp đồng đã kết thúc.');

      const newEndDate = this.asDay(details.end_date);
      const currentEndDate = this.asDay(contract.end_date);
      if (newEndDate <= currentEndDate) {
        throw new BadRequestException('Ngày kết thúc mới phải sau ngày kết thúc hiện tại.');
      }

      const contracts = manager.getRepository(Contract);
      await this.assertNoStudentOverlap(
        contracts,
        contract.student.sid,
        this.asDay(contract.start_date),
        newEndDate,
        id,
      );
      if (contract.room) {
        await this.assertRoomHasCapacity(
          contracts,
          contract.room,
          this.asDay(contract.start_date),
          newEndDate,
          id,
        );
      }
      contract.end_date = this.fromDay(newEndDate);
      await contracts.save(contract);
      if (contract.room) await this.refreshRoomOccupancy(manager, contract.room.id);
    });
    return this.findOne(id);
  }

  async liquidate(id: number, details: LiquidateContractDto): Promise<Contract> {
    await this.dataSource.transaction(async (manager) => {
      const contract = await this.lockContract(manager, id);
      if (!contract.is_active) throw new ConflictException('Hợp đồng đã kết thúc.');

      const liquidationDate = this.asDay(details.end_date ?? this.today());
      const startDate = this.asDay(contract.start_date);
      if (liquidationDate < startDate || liquidationDate > this.today()) {
        throw new BadRequestException('Ngày thanh lý phải từ ngày bắt đầu đến hôm nay.');
      }
      contract.end_date = this.fromDay(liquidationDate);
      contract.is_active = false;
      await manager.getRepository(Contract).save(contract);
      if (contract.room) await this.refreshRoomOccupancy(manager, contract.room.id);
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const contract = await this.lockContract(manager, id);
      const paymentCount = await manager.getRepository(Payment).count({
        where: { contract: { contract_id: id } },
      });
      if (paymentCount) {
        throw new ConflictException('Không thể xóa hợp đồng đã có lịch sử thanh toán.');
      }

      await manager.getRepository(Contract).delete(id);
      if (contract.room) await this.refreshRoomOccupancy(manager, contract.room.id);
    });
  }

  private async lockContract(manager: EntityManager, id: number): Promise<Contract> {
    const contract = await manager.getRepository(Contract).findOne({
      where: { contract_id: id },
      relations: { student: true, room: true },
      lock: { mode: 'pessimistic_write' },
    });
    if (!contract) throw new NotFoundException('Không tìm thấy hợp đồng.');
    return contract;
  }

  private async assertNoStudentOverlap(
    repository: Repository<Contract>,
    studentSid: string,
    startDate: string,
    endDate: string,
    excludeId?: number,
  ): Promise<void> {
    const query = repository.createQueryBuilder('contract')
      .innerJoin('contract.student', 'student')
      .where('student.sid = :studentSid', { studentSid })
      .andWhere('contract.is_active = :isActive', { isActive: true })
      .andWhere('contract.start_date <= :endDate', { endDate })
      .andWhere('contract.end_date >= :startDate', { startDate });
    if (excludeId !== undefined) query.andWhere('contract.contract_id != :excludeId', { excludeId });

    if (await query.getCount()) {
      throw new ConflictException('Sinh viên đã có hợp đồng còn hiệu lực trong thời gian này.');
    }
  }

  private async assertRoomHasCapacity(
    repository: Repository<Contract>,
    room: Room,
    startDate: string,
    endDate: string,
    excludeId?: number,
  ): Promise<void> {
    const query = repository.createQueryBuilder('contract')
      .innerJoin('contract.room', 'room')
      .where('room.id = :roomId', { roomId: room.id })
      .andWhere('contract.is_active = :isActive', { isActive: true })
      .andWhere('contract.start_date <= :endDate', { endDate })
      .andWhere('contract.end_date >= :startDate', { startDate });
    if (excludeId !== undefined) query.andWhere('contract.contract_id != :excludeId', { excludeId });

    if (await query.getCount() >= room.maxCapacity) {
      throw new ConflictException('Phòng đã đủ sức chứa. Hãy chọn phòng khác.');
    }
  }

  private async refreshRoomOccupancy(manager: EntityManager, roomId: string): Promise<void> {
    const today = this.today();
    const occupancy = await manager.getRepository(Contract).createQueryBuilder('contract')
      .innerJoin('contract.room', 'room')
      .where('room.id = :roomId', { roomId })
      .andWhere('contract.is_active = :isActive', { isActive: true })
      .andWhere('contract.start_date <= :today', { today })
      .andWhere('contract.end_date >= :today', { today })
      .getCount();
    await manager.getRepository(Room).update(roomId, { currentOccupancy: occupancy });
  }

  private assertValidTerm(startDate: string, endDate: string): void {
    if (startDate > endDate) {
      throw new BadRequestException('Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.');
    }
  }

  private asDay(value: string | Date): string {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return value.slice(0, 10);
  }

  private fromDay(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private today(): string {
    return this.asDay(new Date());
  }
}
