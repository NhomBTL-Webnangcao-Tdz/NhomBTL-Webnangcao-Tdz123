import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Role } from '../../common/role.enum';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { UpdateUtilityTariffDto } from './dto/update-utility-tariff.dto';
import { UtilityTariffService } from './utility-tariff.service';

interface AuthenticatedTariffRequest {
  user: { sub: number };
}

@Controller('utility-bill/tariff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class UtilityTariffController {
  constructor(private readonly tariffs: UtilityTariffService) {}

  @Get()
  getCurrent() {
    return this.tariffs.getCurrent();
  }

  @Put()
  update(@Request() req: AuthenticatedTariffRequest, @Body() details: UpdateUtilityTariffDto) {
    return this.tariffs.update(req.user.sub, details);
  }
}
