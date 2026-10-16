import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Role } from '../../common/role.enum';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  function createContext(request: Request): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  }

  it('accepts a bearer token and attaches its verified user to the request', async () => {
    const request = { headers: { authorization: 'Bearer signed-token' } } as Request;
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 9,
        username: 'student.one',
        role: Role.STUDENT,
      }),
    } as unknown as JwtService;
    const guard = new JwtAuthGuard(jwtService);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request).toHaveProperty('user', {
      sub: 9,
      username: 'student.one',
      role: Role.STUDENT,
    });
  });

  it.each([
    undefined,
    'Basic signed-token',
    'Bearer',
    'Bearer signed-token extra',
  ])('rejects a missing or malformed authorization header: %s', async (authorization) => {
    const request = { headers: { authorization } } as Request;
    const guard = new JwtAuthGuard({ verifyAsync: jest.fn() } as unknown as JwtService);

    await expect(guard.canActivate(createContext(request))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects invalid JWTs', async () => {
    const request = { headers: { authorization: 'Bearer invalid-token' } } as Request;
    const jwtService = {
      verifyAsync: jest.fn().mockRejectedValue(new Error('invalid token')),
    } as unknown as JwtService;
    const guard = new JwtAuthGuard(jwtService);

    await expect(guard.canActivate(createContext(request))).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
