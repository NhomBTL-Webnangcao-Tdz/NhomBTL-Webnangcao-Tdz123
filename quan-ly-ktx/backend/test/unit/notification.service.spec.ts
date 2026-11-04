import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Notification } from '../../src/modules/notification/notification.entity';
import { NotificationService } from '../../src/modules/notification/notification.service';

// US-06: người dùng nhận thông báo của chính mình.
function setup(found: Partial<Notification> | null) {
  const repository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(found),
    save: jest.fn().mockResolvedValue(found),
  };
  return { repository, service: new NotificationService(repository as unknown as Repository<Notification>) };
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
});
