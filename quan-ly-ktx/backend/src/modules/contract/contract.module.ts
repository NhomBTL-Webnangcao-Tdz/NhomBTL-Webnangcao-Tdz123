import { Module } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { contractProviders } from './contract.provider';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { RolesGuard } from '../../common/roles.guard';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ContractController],
  providers: [
    ...contractProviders,
    RolesGuard,
    ContractService,
  ],
})
export class ContractModule {}