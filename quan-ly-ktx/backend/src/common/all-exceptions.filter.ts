import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

interface ErrorResult {
  status: number;
  message: string | string[];
}

const databaseErrors: Record<string, ErrorResult> = {
  ER_DUP_ENTRY: { status: HttpStatus.CONFLICT, message: 'Dữ liệu đã tồn tại.' },
  ER_ROW_IS_REFERENCED_2: { status: HttpStatus.CONFLICT, message: 'Không thể xóa vì dữ liệu đang được sử dụng.' },
  ER_NO_REFERENCED_ROW_2: { status: HttpStatus.BAD_REQUEST, message: 'Dữ liệu liên kết không tồn tại.' },
  ER_DATA_TOO_LONG: { status: HttpStatus.BAD_REQUEST, message: 'Dữ liệu vượt quá độ dài cho phép.' },
};

const errorNames: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  413: 'Payload Too Large',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
};

/**
 * Mọi lỗi trả về cùng một dạng { statusCode, error, message, path, timestamp }.
 * Lỗi không lường trước chỉ ghi log ở server, không gửi stack trace hay câu SQL cho client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    if (response.headersSent) return;

    const { status, message } = this.toResult(exception);
    if (status >= 500) {
      const detail = exception instanceof Error ? exception.stack : String(exception);
      this.logger.error(`${request.method} ${request.path}: ${detail}`);
    }

    response.status(status).json({
      statusCode: status,
      error: errorNames[status] ?? 'Error',
      message,
      path: request.path,
      timestamp: new Date().toISOString(),
    });
  }

  private toResult(exception: unknown): ErrorResult {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const message = typeof body === 'string' ? body : (body as { message?: string | string[] }).message;
      // Lỗi parse JSON của Nest chứa lại nội dung client gửi, không trả về nguyên văn.
      if (typeof message === 'string' && /valid JSON|in JSON at position|end of JSON/.test(message)) {
        return { status: exception.getStatus(), message: 'Dữ liệu JSON không hợp lệ.' };
      }
      return { status: exception.getStatus(), message: message ?? exception.message };
    }
    if (exception instanceof EntityNotFoundError) {
      return { status: HttpStatus.NOT_FOUND, message: 'Không tìm thấy dữ liệu.' };
    }
    if (exception instanceof QueryFailedError) {
      const code = (exception.driverError as { code?: string } | undefined)?.code;
      const known = code ? databaseErrors[code] : undefined;
      if (known) return known;
    }
    // Lỗi từ middleware như body-parser (JSON sai cú pháp, body quá lớn).
    const statusCode = (exception as { statusCode?: unknown } | null)?.statusCode;
    if (typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500) {
      return { status: statusCode, message: 'Yêu cầu không hợp lệ.' };
    }
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Lỗi hệ thống. Vui lòng thử lại sau.' };
  }
}
