import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { StudentService } from './student.service';
import { Student } from './student.entity';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  async findAll(): Promise<Student[]> {
    return this.studentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Student | null> {
    return this.studentService.findOne(id);
  }

  @Post()
  async create(@Body() studentData: Partial<Student>): Promise<Student> {
    return this.studentService.create(studentData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() studentData: Partial<Student>): Promise<Student | null> {
    return this.studentService.update(id, studentData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.studentService.remove(id);
  }
}