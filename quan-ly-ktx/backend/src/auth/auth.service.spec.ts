import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/role.enum';
import { AuthService } from './auth.service';
import { UsersService } from './entities/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, 'findByUsername' | 'findById' | 'createUser'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  beforeEach(async () => {
    usersService = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
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
});
