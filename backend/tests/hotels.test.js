import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import { env } from "../src/config/env.js";

describe("GET /api/v1/hotels — query validation", () => {
  it("rejects maxPrice < minPrice with 422", async () => {
    const res = await request(app)
      .get("/api/v1/hotels")
      .query({ minPrice: 200, maxPrice: 100 });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects pageSize > 50 with 422", async () => {
    const res = await request(app)
      .get("/api/v1/hotels")
      .query({ pageSize: 100 });
    expect(res.status).toBe(422);
  });

  it("rejects an unknown sort key", async () => {
    const res = await request(app)
      .get("/api/v1/hotels")
      .query({ sort: "random" });
    expect(res.status).toBe(422);
  });
});

describe("GET /api/v1/hotels/:id — id validation", () => {
  it("rejects a non-ObjectId path param", async () => {
    const res = await request(app).get("/api/v1/hotels/not-a-real-id");
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("Hotel admin mutations require auth + admin role", () => {
  it("returns 401 without a token on POST /hotels", async () => {
    const res = await request(app).post("/api/v1/hotels").send({ name: "X" });
    expect(res.status).toBe(401);
  });

  it("returns 403 with a non-admin user token on POST /hotels", async () => {
    const userToken = jwt.sign(
      { sub: "507f1f77bcf86cd799439011", role: "user" },
      env.jwtSecret,
    );
    const res = await request(app)
      .post("/api/v1/hotels")
      .set("Authorization", `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });
});
