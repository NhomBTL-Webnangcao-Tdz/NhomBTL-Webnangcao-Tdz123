import { OmitType, PartialType } from '@nestjs/mapped-types';
import { StudentProfileDto } from './student-profile.dto';

// Mã sinh viên là khóa chính nên không cho sửa.
export class UpdateStudentDto extends PartialType(OmitType(StudentProfileDto, ['sid'] as const)) {}
