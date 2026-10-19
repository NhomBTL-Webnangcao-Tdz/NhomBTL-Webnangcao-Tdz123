import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Request,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { UtilityBillService } from './utility-bill.service';
import { UtilityBill } from './utility-bill.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { Role } from '../../common/role.enum';
import { CreateGeneralChargeDto } from './dto/create-general-charge.dto';

interface AuthenticatedBillRequest {
  user: { sub: number; role: Role };
}

interface UploadedReceiptFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

const receiptImageInterceptor = FileInterceptor('receiptImage', {
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(new BadRequestException('Ảnh hóa đơn phải có định dạng JPG, PNG hoặc WEBP.'), false);
      return;
    }
    callback(null, true);
  },
});

@Controller('utility-bill')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class UtilityBillController {
  constructor(private readonly utilityBillService: UtilityBillService) {}

  @Get()
  async findAll() {
    return this.utilityBillService.findAll();
  }

  @Get(':id/receipt')
  @Roles(Role.ADMIN, Role.MANAGER, Role.STUDENT)
  async getReceipt(
    @Param('id') id: string,
    @Request() req: AuthenticatedBillRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const image = await this.utilityBillService.getReceiptImage(+id, req.user.sub, req.user.role);
    response.setHeader('Content-Type', image.mimeType);
    response.setHeader('Cache-Control', 'private, no-store');
    return new StreamableFile(image.stream);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.utilityBillService.findOne(+id);
  }

  @Post()
  async create(@Body() utilityBillData: Partial<UtilityBill>): Promise<UtilityBill> {
    return this.utilityBillService.create(utilityBillData);
  }

  @Post('general')
  @UseInterceptors(receiptImageInterceptor)
  async createGeneralCharge(
    @Body() details: CreateGeneralChargeDto,
    @UploadedFile() image?: UploadedReceiptFile,
  ) {
    return this.utilityBillService.createGeneralCharge(details, image);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() utilityBillData: Partial<UtilityBill>) {
    return this.utilityBillService.update(+id, utilityBillData);
  }

  @Patch(':id/shares/:sid')
  async updateSharePayment(
    @Param('id') id: string,
    @Param('sid') studentSid: string,
    @Body('isPaid') isPaid: boolean,
  ) {
    return this.utilityBillService.updateSharePayment(+id, studentSid, isPaid);
  }

  @Post(':id/shares/:sid/remind')
  async remindStudent(
    @Param('id') id: string,
    @Param('sid') studentSid: string,
  ) {
    return this.utilityBillService.remindStudent(+id, studentSid);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    return this.utilityBillService.remove(+id);
  }
}