import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Notification } from '../../src/modules/notification/notification.entity';
import { NotificationService } from '../../src/modules/notification/notification.service';
import { Contract } from '../../src/modules/contract/contract.entity';

// US-06: người dùng nhận thông báo của chính mình.
function setup(found: Partial<Notification> | null, expiringContracts = []) {
  const savedNotifications: Partial<Notification>[] = [];
  const repository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(found),
    create: jest.fn((notification) => notification),
    save: jest.fn(async (notification) => {
      savedNotifications.push(notification);
      return notification;
    }),
  };
  repository.findOne.mockImplementation(async (criteria) => {
    const where = criteria.where as Partial<Notification>;
    return savedNotifications.find((notification) => (
      notification.userId === where.userId
      && notification.title === where.title
      && notification.message === where.message
    )) || found;
  });
  const queryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(expiringContracts),
  };
  const dataSource = {
    getRepository: jest.fn((entity) => {
      if (entity === Contract) return { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) };
      return {};
    }),
  };
  return {
    repository,
    queryBuilder,
    savedNotifications,
    service: new NotificationService(
      repository as unknown as Repository<Notification>,
      dataSource as never,
    ),
  };
}

describe('US-06 NotificationService', () => {
  it('chỉ lấy thông báo của người dùng, mới nhất trước, tối đa 30', async () => {
    const { service, repository } = setup(null);
    await service.listForUser(5);
    expect(repository.find).toHaveBeenCalledWith({ where: { userId: 5 }, order: { createdAt: 'DESC' }, take: 30 });
  });

  it('đánh dấu đã đọc', async () => {
    const { service, repository } = setup({ id: 'n1', isRead: false });
    await expect(service.markRead('n1', 5)).resolves.toMatchObject({ isRead: true });
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'n1', userId: 5 } });
    expect(repository.save).toHaveBeenCalled();
  });

  it('đã đọc rồi thì không ghi lại', async () => {
    const { service, repository } = setup({ id: 'n1', isRead: true });
    await service.markRead('n1', 5);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('thông báo của người khác trả 404', async () => {
    const { service } = setup(null);
    await expect(service.markRead('n2', 5)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('tạo một thông báo cho sinh viên có hợp đồng sắp hết hạn và không tạo lặp', async () => {
    const contract = { contractId: 12, endDate: '2026-11-20', userId: 5 };
    const { service, queryBuilder, savedNotifications } = setup(null, [contract]);

    await service.runContractExpiryNotifications();
    await service.runContractExpiryNotifications();

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'contract.end_date <= DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY)',
    );
    expect(savedNotifications).toHaveLength(1);
    expect(savedNotifications[0]).toMatchObject({
      userId: 5,
      title: 'Hợp đồng sắp hết hạn',
      message: 'Hợp đồng HĐ-0012 sẽ hết hạn vào ngày 20/11/2026. Vui lòng liên hệ ban quản lý để gia hạn.',
    });
  });
});
