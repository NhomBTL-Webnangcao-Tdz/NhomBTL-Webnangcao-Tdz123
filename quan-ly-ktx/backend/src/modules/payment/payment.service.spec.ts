import { Repository } from 'typeorm';
import { Contract } from '../contract/contract.entity';
import { Payment } from './payment.entity';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
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
});
