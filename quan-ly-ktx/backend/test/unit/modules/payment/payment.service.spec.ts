import { Repository } from 'typeorm';
import { Contract } from '../../../../src/modules/contract/contract.entity';
import { Payment } from '../../../../src/modules/payment/payment.entity';
import { PaymentService } from '../../../../src/modules/payment/payment.service';
import { CreatePaymentDto } from '../../../../src/modules/payment/dto/create-payment.dto';
import { UpdatePaymentDto } from '../../../../src/modules/payment/dto/update-payment.dto';

describe('PaymentService', () => {
  const paymentInput: CreatePaymentDto = {
    amount: 1250000,
    payment_date: '2026-11-06T09:30:00.000Z',
    payment_type: 'Tiền phòng',
    contractId: 17,
  };

  it('filters payment history by contract ID', async () => {
    const paymentRepository = {
      find: jest.fn().mockResolvedValue([]),
    };
    const contractRepository = {} as Repository<Contract>;
    const service = new PaymentService(
      paymentRepository as unknown as Repository<Payment>,
      contractRepository,
    );

    await service.findAll('17');

    expect(paymentRepository.find).toHaveBeenCalledWith(expect.objectContaining({
      where: { contract: { contract_id: 17 } },
      order: { payment_date: 'DESC', payment_id: 'DESC' },
    }));
  });

  it('rejects malformed contract IDs', async () => {
    const paymentRepository = { find: jest.fn() };
    const service = new PaymentService(
      paymentRepository as unknown as Repository<Payment>,
      {} as Repository<Contract>,
    );

    await expect(service.findAll('invalid')).rejects.toThrow('Mã hợp đồng không hợp lệ.');
    expect(paymentRepository.find).not.toHaveBeenCalled();
  });

  it('records a payment against the selected contract', async () => {
    const contract = { contract_id: 17 } as Contract;
    const payment = {
      amount: paymentInput.amount,
      payment_date: new Date(paymentInput.payment_date),
      payment_type: paymentInput.payment_type,
      contract,
    };
    const paymentRepository = {
      create: jest.fn((details) => details),
      save: jest.fn().mockResolvedValue(payment),
    };
    const contractRepository = {
      findOneBy: jest.fn().mockResolvedValue(contract),
    };
    const service = new PaymentService(
      paymentRepository as unknown as Repository<Payment>,
      contractRepository as unknown as Repository<Contract>,
    );

    await expect(service.create(paymentInput)).resolves.toBe(payment);

    expect(contractRepository.findOneBy).toHaveBeenCalledWith({ contract_id: 17 });
    expect(paymentRepository.create).toHaveBeenCalledWith({
      amount: 1250000,
      payment_date: new Date(paymentInput.payment_date),
      payment_type: 'Tiền phòng',
      contract,
    });
    expect(paymentRepository.save).toHaveBeenCalledWith(payment);
  });

  it('rejects recording a payment for a missing contract', async () => {
    const paymentRepository = { create: jest.fn(), save: jest.fn() };
    const contractRepository = { findOneBy: jest.fn().mockResolvedValue(null) };
    const service = new PaymentService(
      paymentRepository as unknown as Repository<Payment>,
      contractRepository as unknown as Repository<Contract>,
    );

    await expect(service.create(paymentInput)).rejects.toThrow('Không tìm thấy hợp đồng.');
    expect(paymentRepository.create).not.toHaveBeenCalled();
    expect(paymentRepository.save).not.toHaveBeenCalled();
  });

  it('updates payment details and can associate the payment with another contract', async () => {
    const oldContract = { contract_id: 17 } as Contract;
    const newContract = { contract_id: 18 } as Contract;
    const payment = {
      payment_id: 4,
      amount: 100,
      payment_date: new Date('2026-10-01T00:00:00.000Z'),
      payment_type: 'Cọc',
      contract: oldContract,
    } as Payment;
    const paymentRepository = {
      findOneBy: jest.fn().mockResolvedValue(payment),
      save: jest.fn().mockResolvedValue(payment),
    };
    const contractRepository = {
      findOneBy: jest.fn().mockResolvedValue(newContract),
    };
    const service = new PaymentService(
      paymentRepository as unknown as Repository<Payment>,
      contractRepository as unknown as Repository<Contract>,
    );
    const details: UpdatePaymentDto = {
      amount: 1250000,
      payment_date: '2026-11-06T09:30:00.000Z',
      payment_type: ' Tiền phòng ',
      contractId: 18,
    };

    await service.update(4, details);

    expect(paymentRepository.findOneBy).toHaveBeenCalledWith({ payment_id: 4 });
    expect(contractRepository.findOneBy).toHaveBeenCalledWith({ contract_id: 18 });
    expect(payment).toMatchObject({
      amount: 1250000,
      payment_date: new Date(details.payment_date!),
      payment_type: 'Tiền phòng',
      contract: newContract,
    });
    expect(paymentRepository.save).toHaveBeenCalledWith(payment);
  });

  it('rejects updating a payment that does not exist', async () => {
    const paymentRepository = {
      findOneBy: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };
    const service = new PaymentService(
      paymentRepository as unknown as Repository<Payment>,
      {} as Repository<Contract>,
    );

    await expect(service.update(404, { amount: 150 }))
      .rejects.toThrow('Không tìm thấy giao dịch thanh toán.');
    expect(paymentRepository.save).not.toHaveBeenCalled();
  });

  it('deletes a payment and reports when the payment does not exist', async () => {
    const paymentRepository = {
      delete: jest.fn()
        .mockResolvedValueOnce({ affected: 1 })
        .mockResolvedValueOnce({ affected: 0 }),
    };
    const service = new PaymentService(
      paymentRepository as unknown as Repository<Payment>,
      {} as Repository<Contract>,
    );

    await expect(service.remove(4)).resolves.toBeUndefined();
    expect(paymentRepository.delete).toHaveBeenCalledWith({ payment_id: 4 });
    await expect(service.remove(404)).rejects.toThrow('Không tìm thấy giao dịch thanh toán.');
  });
});
