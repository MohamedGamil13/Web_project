import { calculateReservationPricing } from "../src/utils/pricing.js";

describe("calculateReservationPricing", () => {
  it("calculates subtotal, service fee, tax, and total", () => {
    const result = calculateReservationPricing({ nights: 3, pricePerNight: 100 });
    expect(result.subtotal).toBe(300);
    expect(result.serviceFee).toBe(24);
    expect(result.taxAmount).toBe(45.36);
    expect(result.total).toBe(369.36);
  });

  it("returns zeroes for zero-night input", () => {
    const result = calculateReservationPricing({ nights: 0, pricePerNight: 100 });
    expect(result.subtotal).toBe(0);
    expect(result.serviceFee).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(0);
  });
});
