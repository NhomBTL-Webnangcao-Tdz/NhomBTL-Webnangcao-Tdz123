import { Controller, Get, Post, Body, Param, Put, Delete, Request, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { Student } from './student.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { Role } from '../../common/role.enum';
import { StudentProfileDto } from './dto/student-profile.dto';
import { ResidenceRequestDto } from './dto/residence-request.dto';

interface AuthenticatedStudentRequest {
  user: { sub: number };
}

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('me/portal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async getMyPortal(@Request() req: AuthenticatedStudentRequest) {
    return this.studentService.getPortalData(req.user.sub);
  }

  @Put('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async saveMyProfile(
    @Request() req: AuthenticatedStudentRequest,
    @Body() profile: StudentProfileDto,
  ) {
    return this.studentService.saveMyProfile(req.user.sub, profile);
  }

  @Post('me/residence-request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  async requestResidence(
    @Request() req: AuthenticatedStudentRequest,
    @Body() requestDto: ResidenceRequestDto,
  ) {
    return this.studentService.requestResidence(req.user.sub, requestDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async findAll(): Promise<Student[]> {
    return this.studentService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async findOne(@Param('id') id: string): Promise<Student | null> {
    return this.studentService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(@Body() studentData: Partial<Student>): Promise<Student> {
    return this.studentService.create(studentData);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(@Param('id') id: string, @Body() studentData: Partial<Student>): Promise<Student | null> {
    return this.studentService.update(id, studentData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    return this.studentService.remove(id);
  }
}