export function getNextMonthPaymentDate(year: number, month: number): Date {
  return new Date(year, month, 10);
}

export function calculateUtilityAmount(
  oldElectricReading: number,
  electricReading: number,
  oldWaterReading: number,
  waterReading: number,
  electricPrice: number,
  waterPrice: number,
): number {
  return Math.round((
    (electricReading - oldElectricReading) * electricPrice
    + (waterReading - oldWaterReading) * waterPrice
  ) * 100) / 100;
}

export function calculateMonthlyBillAmount(utilityAmount: number, roomRentAmount: number): number {
  return Math.round((utilityAmount + roomRentAmount) * 100) / 100;
}

export function splitUtilityAmount(totalAmount: number, studentSids: string[]) {
  const sortedSids = [...studentSids].sort((left, right) => left.localeCompare(right));
  if (!sortedSids.length) return [];
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / sortedSids.length);
  const extraCents = totalCents % sortedSids.length;
  return sortedSids.map((sid, index) => ({
    sid,
    amount: (baseCents + (index < extraCents ? 1 : 0)) / 100,
  }));
}
