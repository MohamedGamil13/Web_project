import { listHotelsQuerySchema } from "../src/validators/hotels.validators.js";

function run(input) {
  return listHotelsQuerySchema.validate(input, {
    convert: true,
    abortEarly: false,
  });
}

describe("listHotelsQuerySchema — price range", () => {
  it("accepts maxPrice on its own", () => {
    const { error, value } = run({ maxPrice: 200 });
    expect(error).toBeUndefined();
    expect(value.maxPrice).toBe(200);
    expect(value.minPrice).toBeUndefined();
  });

  it("accepts minPrice on its own", () => {
    const { error, value } = run({ minPrice: 50 });
    expect(error).toBeUndefined();
    expect(value.minPrice).toBe(50);
    expect(value.maxPrice).toBeUndefined();
  });

  it("accepts both when maxPrice ≥ minPrice", () => {
    const { error, value } = run({ minPrice: 50, maxPrice: 200 });
    expect(error).toBeUndefined();
    expect(value).toMatchObject({ minPrice: 50, maxPrice: 200 });
  });

  it("rejects maxPrice < minPrice", () => {
    const { error } = run({ minPrice: 200, maxPrice: 100 });
    expect(error).toBeDefined();
    expect(error.details.some((d) => d.path.includes("maxPrice"))).toBe(true);
  });

  it("rejects negative maxPrice without a minPrice", () => {
    const { error } = run({ maxPrice: -10 });
    expect(error).toBeDefined();
  });

  it("coerces string query values to numbers", () => {
    const { error, value } = run({
      minPrice: "50",
      maxPrice: "200",
      page: "2",
    });
    expect(error).toBeUndefined();
    expect(value.minPrice).toBe(50);
    expect(value.maxPrice).toBe(200);
    expect(value.page).toBe(2);
  });
});
