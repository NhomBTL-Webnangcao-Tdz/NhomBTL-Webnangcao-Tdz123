import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateContractDto } from '../../../src/modules/contract/dto/create-contract.dto';
import { RegisterDto } from '../../../src/auth/dto/register.dto';
import { validationExceptionFactory } from '../../../src/common/validation-exception';

const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: validationExceptionFactory,
});

async function messages(metatype: new () => object, body: unknown): Promise<string[]> {
  try {
    await pipe.transform(body, { type: 'body', metatype });
  } catch (error) {
    expect(error).toBeInstanceOf(BadRequestException);
    return ((error as BadRequestException).getResponse() as { message: string[] }).message;
  }
  throw new Error('Mong đợi lỗi validate');
}

const contract = {
  student: { sid: 'test-sv' },
  start_date: '2026-09-01',
  end_date: '2027-06-30',
  deposit_amount: 0,
};

describe('validationExceptionFactory', () => {
  it('đổi câu tiếng Anh thành tiếng Việt, không lặp lại', async () => {
    await expect(messages(CreateContractDto, { ...contract, deposit_amount: -1 })).resolves.toEqual(['Tiền đặt cọc không hợp lệ.']);
  });

  it('giữ thông báo viết riêng trong DTO', async () => {
    await expect(messages(RegisterDto, { username: 'abc', password: '123' })).resolves.toContain('Mật khẩu phải có ít nhất 6 ký tự');
  });

  it('báo lỗi ở đối tượng lồng nhau', async () => {
    await expect(messages(CreateContractDto, { ...contract, student: { sid: '' } })).resolves.toEqual(['Mã sinh viên không hợp lệ.']);
  });

  it('báo trường lạ', async () => {
    await expect(messages(CreateContractDto, { ...contract, role: 'ADMIN' })).resolves.toEqual(['Không được gửi trường role.']);
  });
});
