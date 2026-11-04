import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { RejectResidenceRequestDto } from '../../../../../src/modules/student/dto/reject-residence-request.dto';
import { StudentProfileDto } from '../../../../../src/modules/student/dto/student-profile.dto';
import { UpdateStudentDto } from '../../../../../src/modules/student/dto/update-student.dto';

const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
const check = (metatype: new () => object, body: unknown) => pipe.transform(body, { type: 'body', metatype });

const validBody = { sid: 'test-sv-01', sname: 'test SV', email: 'test-sv@example.test', phone: '0900000000' };

describe('Student DTO', () => {
  it('nhận hồ sơ hợp lệ', async () => {
    await expect(check(StudentProfileDto, validBody)).resolves.toMatchObject({ sid: 'test-sv-01' });
  });

  it('chặn gán role khi tạo sinh viên', async () => {
    await expect(check(StudentProfileDto, { ...validBody, role: 'ADMIN' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cập nhật một phần nhưng không cho đổi sid, role', async () => {
    await expect(check(UpdateStudentDto, { phone: '0911111111' })).resolves.toMatchObject({ phone: '0911111111' });
    await expect(check(UpdateStudentDto, { sid: 'khac' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(check(UpdateStudentDto, { role: 'ADMIN' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('email sai định dạng bị từ chối', async () => {
    await expect(check(UpdateStudentDto, { email: 'khong-phai-email' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lý do từ chối đơn không quá 500 ký tự', async () => {
    await expect(check(RejectResidenceRequestDto, {})).resolves.toBeDefined();
    await expect(check(RejectResidenceRequestDto, { reviewNote: 'x'.repeat(501) })).rejects.toBeInstanceOf(BadRequestException);
    await expect(check(RejectResidenceRequestDto, { reviewNote: 1 })).rejects.toBeInstanceOf(BadRequestException);
  });
});
