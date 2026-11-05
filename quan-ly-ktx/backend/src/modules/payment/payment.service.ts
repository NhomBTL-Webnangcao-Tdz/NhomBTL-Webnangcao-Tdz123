import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Contract } from '../contract/contract.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('PAYMENT_REPOSITORY')
    private readonly paymentRepository: Repository<Payment>,
    @Inject('CONTRACT_REPOSITORY')
    private readonly contractRepository: Repository<Contract>,
  ) {}

  async findAll(contractId?: string) {
    const where: { contract?: { contract_id: number } } = {};
    if (contractId !== undefined) {
      const parsedId = Number(contractId);
      if (!Number.isInteger(parsedId) || parsedId < 1) {
        throw new BadRequestException('Mã hợp đồng không hợp lệ.');
      }
      where.contract = { contract_id: parsedId };
    }

    return this.paymentRepository.find({
      where,
      relations: { contract: { student: true, room: true } },
      order: { payment_date: 'DESC', payment_id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const payment = await this.paymentRepository.findOne({
      where: { payment_id: id },
      relations: { contract: { student: true, room: true } },
    });
    if (!payment) throw new NotFoundException('Không tìm thấy giao dịch thanh toán.');
    return payment;
  }

  async create(details: CreatePaymentDto) {
    const contract = await this.contractRepository.findOneBy({ contract_id: details.contractId });
    if (!contract) throw new NotFoundException('Không tìm thấy hợp đồng.');

    const payment = this.paymentRepository.create({
      amount: details.amount,
      payment_date: new Date(details.payment_date),
      payment_type: details.payment_type.trim(),
      contract,
    });
    return this.paymentRepository.save(payment);
  }

  async update(id: number, details: UpdatePaymentDto) {
    const payment = await this.paymentRepository.findOneBy({ payment_id: id });
    if (!payment) throw new NotFoundException('Không tìm thấy giao dịch thanh toán.');

    if (details.contractId !== undefined) {
      const contract = await this.contractRepository.findOneBy({ contract_id: details.contractId });
      if (!contract) throw new NotFoundException('Không tìm thấy hợp đồng.');
      payment.contract = contract;
    }
    if (details.amount !== undefined) payment.amount = details.amount;
    if (details.payment_date !== undefined) payment.payment_date = new Date(details.payment_date);
    if (details.payment_type !== undefined) payment.payment_type = details.payment_type.trim();

    return this.paymentRepository.save(payment);
  }

  async remove(id: number): Promise<void> {
    const result = await this.paymentRepository.delete({ payment_id: id });
    if (!result.affected) throw new NotFoundException('Không tìm thấy giao dịch thanh toán.');
  }
}
