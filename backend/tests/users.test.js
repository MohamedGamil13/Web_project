import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import { env } from "../src/config/env.js";
import {
  changePasswordSchema,
  updateMeSchema,
} from "../src/validators/users.validators.js";

const userToken = () =>
  jwt.sign({ sub: "507f1f77bcf86cd799439011", role: "user" }, env.jwtSecret);

describe("GET /api/v1/users/me — auth gating", () => {
  it("returns 401 with no Authorization header", async () => {
    const res = await request(app).get("/api/v1/users/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 with a malformed bearer token", async () => {
    const res = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", "Bearer not.a.jwt");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/v1/users/me — auth gating", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me")
      .send({ name: "Anyone" });
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/v1/users/me/password — auth gating", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me/password")
      .send({ currentPassword: "Password1", newPassword: "NewPassword1" });
    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/users/me/password/verify — auth gating", () => {
  it("returns 401 with no token", async () => {
    const res = await request(app)
      .post("/api/v1/users/me/password/verify")
      .send({ currentPassword: "Password1" });
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/v1/users/me — body validation", () => {
  it("rejects an empty body with 422", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({});
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects an invalid email with 422", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ email: "not-an-email" });
    expect(res.status).toBe(422);
    expect(res.body.error.details.some((d) => d.field === "email")).toBe(true);
  });
});

describe("PATCH /api/v1/users/me/password — body validation", () => {
  it("rejects an empty body with 422", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me/password")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({});
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects weak newPassword with 422", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me/password")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ currentPassword: "Password1", newPassword: "short" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/v1/users/me/password/verify — body validation", () => {
  it("rejects missing currentPassword with 422", async () => {
    const res = await request(app)
      .post("/api/v1/users/me/password/verify")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({});
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("updateMeSchema — unit", () => {
  it("accepts a partial body with only a name", () => {
    const { error, value } = updateMeSchema.validate(
      { name: "Alice" },
      { convert: true },
    );
    expect(error).toBeUndefined();
    expect(value.name).toBe("Alice");
  });

  it("lowercases email on the way through", () => {
    const { error, value } = updateMeSchema.validate(
      { email: "ALICE@Example.COM" },
      { convert: true },
    );
    expect(error).toBeUndefined();
    expect(value.email).toBe("alice@example.com");
  });

  it("allows empty string to clear phone", () => {
    const { error, value } = updateMeSchema.validate(
      { phone: "" },
      { convert: true },
    );
    expect(error).toBeUndefined();
    expect(value.phone).toBe("");
  });
});

describe("changePasswordSchema — unit", () => {
  it("accepts a valid password-change payload", () => {
    const { error, value } = changePasswordSchema.validate(
      { newPassword: "NewPassword1" },
      { convert: true },
    );
    expect(error).toBeUndefined();
    expect(value.newPassword).toBe("NewPassword1");
  });

  it("rejects missing newPassword", () => {
    const { error } = changePasswordSchema.validate({}, { convert: true });
    expect(error).toBeDefined();
  });
});
