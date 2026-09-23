import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { studentProviders } from './student.provider';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StudentController],
  providers: [
    ...studentProviders,
    StudentService,
  ],
})
export class StudentModule {}