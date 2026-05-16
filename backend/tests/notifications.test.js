import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import { env } from "../src/config/env.js";

const userToken = () =>
  jwt.sign({ sub: "507f1f77bcf86cd799439011", role: "user" }, env.jwtSecret);

describe("Notification routes are auth-protected", () => {
  it("returns 401 on GET /notifications/me with no token", async () => {
    const res = await request(app).get("/api/v1/notifications/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 on PATCH /notifications/:id/read with no token", async () => {
    const res = await request(app).patch(
      "/api/v1/notifications/507f1f77bcf86cd799439011/read",
    );
    expect(res.status).toBe(401);
  });
});

describe("Notification route validation", () => {
  it("rejects invalid notification id format", async () => {
    const res = await request(app)
      .patch("/api/v1/notifications/not-real/read")
      .set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
