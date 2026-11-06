import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Role } from '../../../src/common/role.enum';
import { AuthService } from '../../../src/auth/auth.service';
import { UsersService } from '../../../src/auth/entities/users.service';
import { LoginAttemptService } from '../../../src/auth/login-attempt.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, 'findByUsername' | 'findById' | 'createUser' | 'updatePassword'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  beforeEach(async () => {
    usersService = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
      updatePassword: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        LoginAttemptService,
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('registers a normalized student account and stores only a bcrypt hash', async () => {
    usersService.findByUsername.mockResolvedValue(null);
    usersService.createUser.mockImplementation(async (username, password) => ({
      id: 7,
      username,
      password,
      role: Role.STUDENT,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    }));

    const result = await service.register({ username: '  Student.One  ', password: 'strong-password' });
    const storedPassword = usersService.createUser.mock.calls[0][1];

    expect(usersService.findByUsername).toHaveBeenCalledWith('student.one');
    expect(usersService.createUser).toHaveBeenCalledWith('student.one', storedPassword);
    expect(storedPassword).not.toBe('strong-password');
    expect(await bcrypt.compare('strong-password', storedPassword)).toBe(true);
    expect(result.user).toEqual(expect.objectContaining({
      id: 7,
      username: 'student.one',
      role: Role.STUDENT,
    }));
    expect(result.user).not.toHaveProperty('password');
  });

  it('rejects usernames that already exist', async () => {
    usersService.findByUsername.mockResolvedValue({
      id: 1,
      username: 'student.one',
      password: 'hash',
      role: Role.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(service.register({ username: 'student.one', password: 'strong-password' }))
      .rejects.toBeInstanceOf(ConflictException);
    expect(usersService.createUser).not.toHaveBeenCalled();
  });

  it('issues a JWT and returns safe account details on successful login', async () => {
    usersService.findByUsername.mockResolvedValue({
      id: 7,
      username: 'student.one',
      password: await bcrypt.hash('strong-password', 4),
      role: Role.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    jwtService.signAsync.mockResolvedValue('signed-jwt');

    const result = await service.login({ username: 'STUDENT.ONE', password: 'strong-password' });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 7,
      username: 'student.one',
      role: Role.STUDENT,
    });
    expect(result.access_token).toBe('signed-jwt');
    expect(result.user).toEqual({ id: 7, username: 'student.one', role: Role.STUDENT });
    expect(result.user).not.toHaveProperty('password');
  });

  it('uses the same unauthorized response for unknown users and wrong passwords', async () => {
    usersService.findByUsername.mockResolvedValue(null);
    await expect(service.login({ username: 'unknown', password: 'wrong-password' }))
      .rejects.toBeInstanceOf(UnauthorizedException);

    usersService.findByUsername.mockResolvedValue({
      id: 7,
      username: 'student.one',
      password: await bcrypt.hash('strong-password', 4),
      role: Role.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await expect(service.login({ username: 'student.one', password: 'wrong-password' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('blocks login with 429 after 5 wrong passwords, even when the sixth is correct', async () => {
    usersService.findByUsername.mockResolvedValue({
      id: 1,
      username: 'student.one',
      password: await bcrypt.hash('right-password', 4),
      role: Role.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    jwtService.signAsync.mockResolvedValue('token');

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(service.login({ username: 'student.one', password: 'wrong' }, '1.1.1.1'))
        .rejects.toBeInstanceOf(UnauthorizedException);
    }

    await expect(service.login({ username: 'student.one', password: 'right-password' }, '1.1.1.1'))
      .rejects.toMatchObject({ status: 429 });
    await expect(service.login({ username: 'student.one', password: 'right-password' }, '2.2.2.2'))
      .resolves.toMatchObject({ access_token: 'token' });
  });

  it('counts unknown usernames too so the lock does not reveal which accounts exist', async () => {
    usersService.findByUsername.mockResolvedValue(null);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(service.login({ username: 'ghost', password: 'wrong' }, '1.1.1.1'))
        .rejects.toBeInstanceOf(UnauthorizedException);
    }

    await expect(service.login({ username: 'ghost', password: 'wrong' }, '1.1.1.1'))
      .rejects.toMatchObject({ status: 429 });
  });

  it('forgets earlier failures after a correct password', async () => {
    usersService.findByUsername.mockResolvedValue({
      id: 1,
      username: 'student.one',
      password: await bcrypt.hash('right-password', 4),
      role: Role.STUDENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    jwtService.signAsync.mockResolvedValue('token');

    for (let round = 0; round < 2; round += 1) {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        await expect(service.login({ username: 'student.one', password: 'wrong' }, '1.1.1.1'))
          .rejects.toBeInstanceOf(UnauthorizedException);
      }
      await expect(service.login({ username: 'student.one', password: 'right-password' }, '1.1.1.1'))
        .resolves.toMatchObject({ access_token: 'token' });
    }
  });

  describe('changePassword', () => {
    const payload = { sub: 1, username: 'student.one' };

    beforeEach(async () => {
      usersService.findByUsername.mockResolvedValue({
        id: 1,
        username: 'student.one',
        password: await bcrypt.hash('old-password', 4),
        role: Role.STUDENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    it('stores a bcrypt hash of the new password', async () => {
      await expect(service.changePassword(payload, { currentPassword: 'old-password', newPassword: 'new-password' }))
        .resolves.toEqual({ message: 'Đã đổi mật khẩu.' });

      const [id, stored] = usersService.updatePassword.mock.calls[0];
      expect(id).toBe(1);
      expect(stored).not.toBe('new-password');
      expect(await bcrypt.compare('new-password', stored)).toBe(true);
    });

    it('answers a wrong current password with 400 so the frontend does not log the user out', async () => {
      await expect(service.changePassword(payload, { currentPassword: 'wrong', newPassword: 'new-password' }))
        .rejects.toBeInstanceOf(BadRequestException);
      expect(usersService.updatePassword).not.toHaveBeenCalled();
    });

    it('rejects a new password equal to the current one', async () => {
      await expect(service.changePassword(payload, { currentPassword: 'old-password', newPassword: 'old-password' }))
        .rejects.toBeInstanceOf(BadRequestException);
      expect(usersService.updatePassword).not.toHaveBeenCalled();
    });

    it('rejects a new password longer than 72 bytes', async () => {
      await expect(service.changePassword(payload, { currentPassword: 'old-password', newPassword: 'ệ'.repeat(30) }))
        .rejects.toBeInstanceOf(BadRequestException);
      expect(usersService.updatePassword).not.toHaveBeenCalled();
    });

    it('locks with 429 after 5 wrong current passwords', async () => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        await expect(service.changePassword(payload, { currentPassword: 'wrong', newPassword: 'new-password' }))
          .rejects.toBeInstanceOf(BadRequestException);
      }

      await expect(service.changePassword(payload, { currentPassword: 'old-password', newPassword: 'new-password' }))
        .rejects.toMatchObject({ status: 429 });
    });

    it('rejects a token whose account no longer matches', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      await expect(service.changePassword(payload, { currentPassword: 'old-password', newPassword: 'new-password' }))
        .rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
