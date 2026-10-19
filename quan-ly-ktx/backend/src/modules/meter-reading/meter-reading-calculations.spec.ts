import {
  calculateMonthlyBillAmount,
  calculateUtilityAmount,
  getNextMonthPaymentDate,
  splitUtilityAmount,
} from './meter-reading-calculations';

describe('meter reading billing calculations', () => {
  it('calculates only electricity and water consumption at the configured prices', () => {
    expect(calculateUtilityAmount(100, 112, 20, 25, 3500, 20000)).toBe(142000);
  });

  it('adds monthly room rent to the utility charge', () => {
    const utilityAmount = calculateUtilityAmount(100, 112, 20, 25, 3500, 20000);
    expect(calculateMonthlyBillAmount(utilityAmount, 1200000)).toBe(1342000);
  });

  it('sets payment due date to the tenth of the following month, including year rollover', () => {
    const novemberDueDate = getNextMonthPaymentDate(2026, 10);
    expect([novemberDueDate.getFullYear(), novemberDueDate.getMonth() + 1, novemberDueDate.getDate()]).toEqual([2026, 11, 10]);
    const januaryDueDate = getNextMonthPaymentDate(2026, 12);
    expect([januaryDueDate.getFullYear(), januaryDueDate.getMonth() + 1, januaryDueDate.getDate()]).toEqual([2027, 1, 10]);
  });

  it('splits the exact total fairly and assigns any leftover cents deterministically', () => {
    expect(splitUtilityAmount(100, ['SV003', 'SV001', 'SV002'])).toEqual([
      { sid: 'SV001', amount: 33.34 },
      { sid: 'SV002', amount: 33.33 },
      { sid: 'SV003', amount: 33.33 },
    ]);
  });
});
