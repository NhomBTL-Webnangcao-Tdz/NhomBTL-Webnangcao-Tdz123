import { ConflictException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { Role } from '../../common/role.enum';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Pick<Repository<User>, 'findOne' | 'create' | 'save'>>;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    service = new UsersService(repository as Repository<User>);
  });

  it('explicitly selects the password hash only for authentication lookup', async () => {
    repository.findOne.mockResolvedValue(null);

    await service.findByUsername('student.one');

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { username: 'student.one' },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('creates a student account by default', async () => {
    const user = { id: 2, username: 'student.one', password: 'bcrypt-hash', role: Role.STUDENT } as User;
    repository.create.mockReturnValue(user);
    repository.save.mockResolvedValue(user);

    await service.createUser('student.one', 'bcrypt-hash');

    expect(repository.create).toHaveBeenCalledWith({
      username: 'student.one',
      password: 'bcrypt-hash',
      role: Role.STUDENT,
    });
    expect(repository.save).toHaveBeenCalledWith(user);
  });

  it('returns a conflict when a concurrent request violates the unique username constraint', async () => {
    repository.create.mockReturnValue({ username: 'student.one' } as User);
    repository.save.mockRejectedValue(new QueryFailedError(
      'INSERT INTO users',
      [],
      { code: 'ER_DUP_ENTRY' },
    ));

    await expect(service.createUser('student.one', 'bcrypt-hash'))
      .rejects.toBeInstanceOf(ConflictException);
  });
});
