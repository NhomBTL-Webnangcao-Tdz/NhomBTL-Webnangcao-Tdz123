import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from '../../../../src/common/role.enum';
import { User } from '../../../../src/auth/entities/user.entity';
import { UsersService } from '../../../../src/auth/entities/users.service';

function setup(target: Partial<User> | null, adminCount = 2) {
  const repository = {
    findOne: jest.fn().mockResolvedValue(target),
    count: jest.fn().mockResolvedValue(adminCount),
    save: jest.fn((user) => Promise.resolve(user)),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn((user) => user),
  };
  return { repository, service: new UsersService(repository as unknown as Repository<User>) };
}

describe('UsersService quản lý tài khoản', () => {
  it('đổi vai trò tài khoản khác', async () => {
    const { service, repository } = setup({ id: 2, role: Role.STUDENT });
    await expect(service.updateRole(2, Role.MANAGER, 1)).resolves.toMatchObject({ id: 2, role: Role.MANAGER });
    expect(repository.save).toHaveBeenCalled();
  });

  it('không cho tự đổi vai trò của mình', async () => {
    const { service, repository } = setup({ id: 1, role: Role.ADMIN });
    await expect(service.updateRole(1, Role.STUDENT, 1)).rejects.toBeInstanceOf(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('không tìm thấy tài khoản trả 404', async () => {
    const { service } = setup(null);
    await expect(service.updateRole(9, Role.MANAGER, 1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('không cho hạ ADMIN cuối cùng', async () => {
    const { service, repository } = setup({ id: 2, role: Role.ADMIN }, 1);
    await expect(service.updateRole(2, Role.MANAGER, 1)).rejects.toBeInstanceOf(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('hạ ADMIN được khi còn ADMIN khác', async () => {
    const { service } = setup({ id: 2, role: Role.ADMIN }, 2);
    await expect(service.updateRole(2, Role.MANAGER, 1)).resolves.toMatchObject({ role: Role.MANAGER });
  });

  it('tạo tài khoản với vai trò chỉ định, mặc định là STUDENT', async () => {
    const { service, repository } = setup(null);
    await service.createUser('a', 'hash');
    await service.createUser('b', 'hash', Role.MANAGER);
    expect(repository.create).toHaveBeenNthCalledWith(1, { username: 'a', password: 'hash', role: Role.STUDENT });
    expect(repository.create).toHaveBeenNthCalledWith(2, { username: 'b', password: 'hash', role: Role.MANAGER });
  });

  it('danh sách sắp theo id và không lấy mật khẩu', async () => {
    const { service, repository } = setup(null);
    await service.findAll();
    const options = repository.find.mock.calls[0][0];
    expect(options.order).toEqual({ id: 'ASC' });
    expect(options.select.password).toBeUndefined();
  });
});
