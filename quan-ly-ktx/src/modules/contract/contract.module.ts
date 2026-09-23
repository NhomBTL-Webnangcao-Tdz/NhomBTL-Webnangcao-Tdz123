import { Module } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { contractProviders } from './contract.provider';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ContractController],
  providers: [
    ...contractProviders,
    ContractService,
  ],
})
export class ContractModule {}