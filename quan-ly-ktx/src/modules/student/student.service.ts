import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Student } from './student.entity';

@Injectable()
export class StudentService {
  constructor(
    @Inject('STUDENT_REPOSITORY')
    private studentRepository: Repository<Student>,
  ) {}

  async findAll(): Promise<Student[]> {
    return this.studentRepository.find();
  }

  async findOne(id: string): Promise<Student | null> {
    return this.studentRepository.findOneBy({ sid: id });
  }

  async create(studentData: Partial<Student>): Promise<Student> {
    const newStudent = this.studentRepository.create(studentData);
    return this.studentRepository.save(newStudent);
  }

  async update(id: string, studentData: Partial<Student>): Promise<Student | null> {
    await this.studentRepository.update(id, studentData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.studentRepository.delete(id);
  }
}