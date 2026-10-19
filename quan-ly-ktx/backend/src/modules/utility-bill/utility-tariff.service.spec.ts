import { DataSource } from 'typeorm';
import { UtilityTariff } from './utility-tariff.entity';
import { UtilityTariffService } from './utility-tariff.service';

describe('UtilityTariffService', () => {
  it('initializes the default tariff atomically when no tariff exists', async () => {
    const tariff = {
      id: 1,
      electricPrice: 3500,
      waterPrice: 20000,
      updatedBy: null,
      updatedAt: new Date(),
    } as UtilityTariff;
    const findOneBy = jest.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(tariff);
    const execute = jest.fn().mockResolvedValue({});
    const orIgnore = jest.fn().mockReturnValue({ execute });
    const values = jest.fn().mockReturnValue({ orIgnore });
    const into = jest.fn().mockReturnValue({ values });
    const insert = jest.fn().mockReturnValue({ into });
    const createQueryBuilder = jest.fn().mockReturnValue({ insert });
    const repository = { findOneBy, createQueryBuilder };
    const dataSource = { getRepository: jest.fn().mockReturnValue(repository) } as unknown as DataSource;
    const service = new UtilityTariffService(dataSource);

    await expect(service.getCurrent()).resolves.toBe(tariff);

    expect(createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(into).toHaveBeenCalledWith(UtilityTariff);
    expect(values).toHaveBeenCalledWith({
      id: 1,
      electricPrice: 3500,
      waterPrice: 20000,
      updatedBy: null,
    });
    expect(orIgnore).toHaveBeenCalledTimes(1);
  });

  it('does not write defaults when a tariff already exists', async () => {
    const tariff = { id: 1, electricPrice: 4000, waterPrice: 22000 } as UtilityTariff;
    const repository = { findOneBy: jest.fn().mockResolvedValue(tariff) };
    const dataSource = { getRepository: jest.fn().mockReturnValue(repository) } as unknown as DataSource;
    const service = new UtilityTariffService(dataSource);

    await expect(service.getCurrent()).resolves.toBe(tariff);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });
});
