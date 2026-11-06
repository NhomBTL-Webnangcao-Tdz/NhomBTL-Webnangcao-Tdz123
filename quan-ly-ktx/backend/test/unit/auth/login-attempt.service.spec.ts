import { HttpException, HttpStatus } from '@nestjs/common';
import { LoginAttemptService } from '../../../src/auth/login-attempt.service';

describe('LoginAttemptService', () => {
  let service: LoginAttemptService;

  const failTimes = (key: string, times: number) => {
    for (let index = 0; index < times; index += 1) service.recordFailure(key);
  };

  beforeEach(() => {
    jest.useFakeTimers();
    service = new LoginAttemptService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows attempts below the limit', () => {
    failTimes('1.1.1.1:an', LoginAttemptService.MAX_FAILURES - 1);

    expect(() => service.assertAllowed('1.1.1.1:an')).not.toThrow();
  });

  it('blocks with 429 and a Vietnamese wait message once the limit is reached', () => {
    failTimes('1.1.1.1:an', LoginAttemptService.MAX_FAILURES);

    let error: unknown;
    try {
      service.assertAllowed('1.1.1.1:an');
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect((error as HttpException).message).toContain('15 phút');
  });

  it('counts each key separately so one attacker cannot lock another address', () => {
    failTimes('1.1.1.1:an', LoginAttemptService.MAX_FAILURES);

    expect(() => service.assertAllowed('2.2.2.2:an')).not.toThrow();
  });

  it('unlocks after the lock time', () => {
    failTimes('1.1.1.1:an', LoginAttemptService.MAX_FAILURES);

    jest.advanceTimersByTime(LoginAttemptService.LOCK_MS + 1);

    expect(() => service.assertAllowed('1.1.1.1:an')).not.toThrow();
  });

  it('clears the counter after a success', () => {
    failTimes('1.1.1.1:an', LoginAttemptService.MAX_FAILURES);

    service.reset('1.1.1.1:an');

    expect(() => service.assertAllowed('1.1.1.1:an')).not.toThrow();
  });
});
