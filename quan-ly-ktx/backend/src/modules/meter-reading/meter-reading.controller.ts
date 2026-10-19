import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  Res,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Role } from '../../common/role.enum';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { ReviewMeterReadingDto } from './dto/review-meter-reading.dto';
import { SubmitMeterReadingDto } from './dto/submit-meter-reading.dto';
import { MeterReadingService } from './meter-reading.service';

interface AuthenticatedMeterReadingRequest {
  user: { sub: number; role: Role };
}

interface MeterPhotoFiles {
  electricPhoto?: UploadedMeterImage[];
  waterPhoto?: UploadedMeterImage[];
}

interface UploadedMeterImage {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

const meterPhotoInterceptor = FileFieldsInterceptor([
  { name: 'electricPhoto', maxCount: 1 },
  { name: 'waterPhoto', maxCount: 1 },
], {
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
  fileFilter: (_request, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(new BadRequestException('Ảnh phải có định dạng JPG, PNG hoặc WEBP.'), false);
      return;
    }
    callback(null, true);
  },
});

@Controller('meter-readings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeterReadingController {
  constructor(private readonly readings: MeterReadingService) {}

  @Get('me/current')
  @Roles(Role.STUDENT)
  current(@Request() req: AuthenticatedMeterReadingRequest) {
    return this.readings.getCurrentForStudent(req.user.sub);
  }

  @Post('me')
  @Roles(Role.STUDENT)
  @UseInterceptors(meterPhotoInterceptor)
  submit(
    @Request() req: AuthenticatedMeterReadingRequest,
    @Body() details: SubmitMeterReadingDto,
    @UploadedFiles() files: MeterPhotoFiles,
  ) {
    return this.readings.submit(req.user.sub, details, {
      electric: files?.electricPhoto?.[0],
      water: files?.waterPhoto?.[0],
    });
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  list() {
    return this.readings.listForManagers();
  }

  @Get(':id/photo/:meter')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STUDENT)
  async photo(
    @Param('id', ParseIntPipe) id: number,
    @Param('meter') meter: 'electric' | 'water',
    @Request() req: AuthenticatedMeterReadingRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const image = await this.readings.getPhoto(req.user.sub, req.user.role, id, meter);
    response.setHeader('Content-Type', image.mimeType);
    response.setHeader('Cache-Control', 'private, no-store');
    return new StreamableFile(image.stream);
  }

  @Patch(':id/review')
  @Roles(Role.ADMIN, Role.MANAGER)
  review(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedMeterReadingRequest,
    @Body() details: ReviewMeterReadingDto,
  ) {
    return this.readings.review(id, req.user.sub, details);
  }
}
