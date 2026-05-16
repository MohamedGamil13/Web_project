function round2(n) {
  return Math.round(n * 100) / 100;
}

export const PRICING_RULES = {
  serviceFeeRate: 0.08,
  taxRate: 0.14,
};

export function calculateReservationPricing({ nights, pricePerNight }) {
  const subtotal = round2(nights * pricePerNight);
  const serviceFee = round2(subtotal * PRICING_RULES.serviceFeeRate);
  const taxableAmount = round2(subtotal + serviceFee);
  const taxAmount = round2(taxableAmount * PRICING_RULES.taxRate);
  const total = round2(subtotal + serviceFee + taxAmount);

  return {
    subtotal,
    serviceFee,
    taxAmount,
    total,
    rules: PRICING_RULES,
  };
}
