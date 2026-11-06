import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface AttemptRecord {
  failures: number;
  /** Thời điểm hết tính lượt sai (ms). Khóa cũng hết ở mốc này. */
  expiresAt: number;
}

/**
 * Giới hạn số lần nhập sai mật khẩu [Đề 3d, 4c].
 *
 * Đếm trong bộ nhớ theo khóa do nơi gọi đưa vào, không cần thêm bảng DB.
 * Backend khởi động lại thì bộ đếm về 0; chạy nhiều máy chủ thì phải chuyển sang Redis.
 */
@Injectable()
export class LoginAttemptService {
  static readonly MAX_FAILURES = 5;
  static readonly LOCK_MS = 15 * 60 * 1000;

  private readonly attempts = new Map<string, AttemptRecord>();

  /** Báo lỗi 429 nếu khóa này đã sai quá số lần cho phép. */
  assertAllowed(key: string): void {
    const record = this.current(key);
    if (!record || record.failures < LoginAttemptService.MAX_FAILURES) return;

    const minutes = Math.ceil((record.expiresAt - Date.now()) / 60000);
    throw new HttpException(
      `Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ${minutes} phút.`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  recordFailure(key: string): void {
    this.removeExpired();
    const failures = (this.current(key)?.failures ?? 0) + 1;
    this.attempts.set(key, { failures, expiresAt: Date.now() + LoginAttemptService.LOCK_MS });
  }

  /** Nhập đúng thì xóa bộ đếm. */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  private current(key: string): AttemptRecord | undefined {
    const record = this.attempts.get(key);
    if (record && record.expiresAt <= Date.now()) {
      this.attempts.delete(key);
      return undefined;
    }
    return record;
  }

  /** Dọn khóa đã hết hạn để Map không phình ra khi bị dò nhiều tên đăng nhập. */
  private removeExpired(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts) {
      if (record.expiresAt <= now) this.attempts.delete(key);
    }
  }
}
