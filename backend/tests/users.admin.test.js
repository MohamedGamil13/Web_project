import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import { env } from "../src/config/env.js";

const adminToken = () =>
  jwt.sign({ sub: "507f1f77bcf86cd799439012", role: "admin" }, env.jwtSecret);
const ownerToken = () =>
  jwt.sign({ sub: "507f1f77bcf86cd799439099", role: "owner" }, env.jwtSecret);
const userToken = () =>
  jwt.sign({ sub: "507f1f77bcf86cd799439011", role: "user" }, env.jwtSecret);

describe("Admin user-management routes", () => {
  it("blocks non-admin from GET /users", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(403);
  });

  it("blocks non-admin from PATCH /users/:id/role", async () => {
    const res = await request(app)
      .patch("/api/v1/users/507f1f77bcf86cd799439011/role")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ role: "admin" });
    expect(res.status).toBe(403);
  });

  it("blocks admin from PATCH /users/:id/role", async () => {
    const res = await request(app)
      .patch("/api/v1/users/507f1f77bcf86cd799439011/role")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ role: "admin" });
    expect(res.status).toBe(403);
  });

  it("validates role payload for owner role patch", async () => {
    const res = await request(app)
      .patch("/api/v1/users/507f1f77bcf86cd799439011/role")
      .set("Authorization", `Bearer ${ownerToken()}`)
      .send({ role: "owner" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
