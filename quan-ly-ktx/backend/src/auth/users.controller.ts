import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { Role } from '../common/role.enum';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './entities/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface AuthenticatedAdminRequest {
  user: { sub: number };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  list() {
    return this.usersService.findAll();
  }

  @Post()
  createManager(@Body() account: RegisterDto) {
    return this.authService.createManager(account);
  }

  @Patch(':id/role')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() details: UpdateUserRoleDto,
    @Request() req: AuthenticatedAdminRequest,
  ) {
    return this.usersService.updateRole(id, details.role, req.user.sub);
  }
}
