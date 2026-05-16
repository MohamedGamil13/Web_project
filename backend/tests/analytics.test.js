import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import { env } from "../src/config/env.js";

const adminToken = () =>
  jwt.sign({ sub: "507f1f77bcf86cd799439012", role: "admin" }, env.jwtSecret);
const userToken = () =>
  jwt.sign({ sub: "507f1f77bcf86cd799439011", role: "user" }, env.jwtSecret);

describe("GET /api/v1/analytics/occupancy-insights", () => {
  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/analytics/occupancy-insights");
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin users", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/occupancy-insights")
      .set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(403);
  });

  it("returns 422 for invalid query", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/occupancy-insights?days=0")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
