import { ArgumentsHost, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { AllExceptionsFilter } from '../../../src/common/all-exceptions.filter';

function run(exception: unknown, headersSent = false) {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'GET', path: '/test' }),
      getResponse: () => ({ status, headersSent }),
    }),
  } as unknown as ArgumentsHost;
  new AllExceptionsFilter().catch(exception, host);
  return { status, body: json.mock.calls[0]?.[0] };
}

const queryError = (code: string) =>
  new QueryFailedError('INSERT INTO `users` VALUES (secret)', [], Object.assign(new Error('sql detail'), { code }));

describe('AllExceptionsFilter', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('giữ nguyên mã và thông báo của HttpException', () => {
    const { status, body } = run(new NotFoundException('Không tìm thấy phòng.'));
    expect(status).toHaveBeenCalledWith(404);
    expect(body).toMatchObject({ statusCode: 404, error: 'Not Found', message: 'Không tìm thấy phòng.', path: '/test' });
    expect(body.timestamp).toEqual(expect.any(String));
  });

  it('giữ danh sách lỗi của ValidationPipe', () => {
    const { body } = run(new BadRequestException(['a sai', 'b sai']));
    expect(body.message).toEqual(['a sai', 'b sai']);
  });

  it.each([
    ['ER_DUP_ENTRY', 409],
    ['ER_ROW_IS_REFERENCED_2', 409],
    ['ER_NO_REFERENCED_ROW_2', 400],
    ['ER_DATA_TOO_LONG', 400],
  ])('đổi lỗi DB %s thành %i, không lộ câu SQL', (code, expected) => {
    const { status, body } = run(queryError(code));
    expect(status).toHaveBeenCalledWith(expected);
    expect(JSON.stringify(body)).not.toMatch(/INSERT|secret|sql detail/);
  });

  it('lỗi DB khác trả 500 chung chung', () => {
    const { status, body } = run(queryError('ER_LOCK_DEADLOCK'));
    expect(status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(body)).not.toMatch(/INSERT|secret/);
  });

  it('lỗi không lường trước không lộ stack trace, vẫn ghi log ở server', () => {
    const { status, body } = run(new Error('mat khau DB la abc'));
    expect(status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(body)).not.toContain('abc');
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('lỗi từ body-parser trả đúng mã 4xx, không lặp lại nội dung gửi lên', () => {
    const { status, body } = run(Object.assign(new SyntaxError('Unexpected token <b>'), { statusCode: 400 }));
    expect(status).toHaveBeenCalledWith(400);
    expect(body.message).toBe('Yêu cầu không hợp lệ.');
  });

  it('không trả lại nội dung JSON sai cú pháp', () => {
    const { status, body } = run(new BadRequestException(`Unexpected token '<', "<b>" is not valid JSON`));
    expect(status).toHaveBeenCalledWith(400);
    expect(body.message).toBe('Dữ liệu JSON không hợp lệ.');
  });

  it('bỏ qua khi response đã gửi', () => {
    const { status } = run(new Error('x'), true);
    expect(status).not.toHaveBeenCalled();
  });
});
