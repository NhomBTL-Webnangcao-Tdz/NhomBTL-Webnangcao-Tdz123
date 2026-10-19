import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { studentProviders } from './student.provider';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { RolesGuard } from '../../common/roles.guard';
import { ResidenceRequestController } from './residence-request.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [StudentController, ResidenceRequestController],
  providers: [
    ...studentProviders,
    RolesGuard,
    StudentService,
  ],
})
export class StudentModule {}