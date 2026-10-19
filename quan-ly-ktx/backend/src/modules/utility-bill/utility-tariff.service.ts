import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UpdateUtilityTariffDto } from './dto/update-utility-tariff.dto';
import { UtilityTariff } from './utility-tariff.entity';

export const DEFAULT_UTILITY_TARIFF = {
  electricPrice: 3500,
  waterPrice: 20000,
};

@Injectable()
export class UtilityTariffService {
  private readonly tariffs: Repository<UtilityTariff>;

  constructor(@Inject('DATA_SOURCE') dataSource: DataSource) {
    this.tariffs = dataSource.getRepository(UtilityTariff);
  }

  async getCurrent(): Promise<UtilityTariff> {
    let tariff = await this.tariffs.findOneBy({ id: 1 });
    if (!tariff) {
      await this.tariffs.createQueryBuilder()
        .insert()
        .into(UtilityTariff)
        .values({ id: 1, ...DEFAULT_UTILITY_TARIFF, updatedBy: null })
        .orIgnore()
        .execute();
      tariff = await this.tariffs.findOneBy({ id: 1 });
    }
    if (!tariff) throw new Error('Không thể tải hoặc khởi tạo đơn giá điện nước.');
    return tariff;
  }

  async update(userId: number, details: UpdateUtilityTariffDto): Promise<UtilityTariff> {
    const tariff = await this.getCurrent();
    tariff.electricPrice = details.electricPrice;
    tariff.waterPrice = details.waterPrice;
    tariff.updatedBy = userId;
    return this.tariffs.save(tariff);
  }
}
