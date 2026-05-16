import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import { env } from "../src/config/env.js";
import { createReservationSchema } from "../src/validators/reservations.validators.js";

const userToken = () =>
  jwt.sign({ sub: "507f1f77bcf86cd799439011", role: "user" }, env.jwtSecret);

describe("Reservation routes are auth-protected", () => {
  it("returns 401 on POST /reservations with no token", async () => {
    const res = await request(app).post("/api/v1/reservations").send({});
    expect(res.status).toBe(401);
  });

  it("returns 401 on GET /reservations/me with no token", async () => {
    const res = await request(app).get("/api/v1/reservations/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 on GET /reservations/:id with no token", async () => {
    const res = await request(app).get(
      "/api/v1/reservations/507f1f77bcf86cd799439011",
    );
    expect(res.status).toBe(401);
  });

  it("returns 401 on GET /reservations/:id/timeline with no token", async () => {
    const res = await request(app).get(
      "/api/v1/reservations/507f1f77bcf86cd799439011/timeline",
    );
    expect(res.status).toBe(401);
  });

  it("returns 401 on PATCH /reservations/:id/cancel with no token", async () => {
    const res = await request(app).patch(
      "/api/v1/reservations/507f1f77bcf86cd799439011/cancel",
    );
    expect(res.status).toBe(401);
  });
});

describe("createReservationSchema — body validation", () => {
  it("rejects missing fields", async () => {
    const res = await request(app)
      .post("/api/v1/reservations")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({});
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    const fields = res.body.error.details.map((d) => d.field);
    expect(fields).toEqual(
      expect.arrayContaining(["roomId", "checkIn", "checkOut", "guests"]),
    );
  });

  it("rejects checkOut <= checkIn", () => {
    const { error } = createReservationSchema.validate(
      {
        roomId: "507f1f77bcf86cd799439011",
        checkIn: "2026-12-01",
        checkOut: "2026-11-30",
        guests: 1,
      },
      { abortEarly: false, convert: true },
    );
    expect(error).toBeDefined();
    expect(error.details.some((d) => d.path.includes("checkOut"))).toBe(true);
  });

  it("rejects checkOut == checkIn (same day, zero nights)", () => {
    const { error } = createReservationSchema.validate(
      {
        roomId: "507f1f77bcf86cd799439011",
        checkIn: "2026-12-01",
        checkOut: "2026-12-01",
        guests: 1,
      },
      { abortEarly: false, convert: true },
    );
    expect(error).toBeDefined();
  });

  it("rejects guests < 1", () => {
    const { error } = createReservationSchema.validate(
      {
        roomId: "507f1f77bcf86cd799439011",
        checkIn: "2026-12-01",
        checkOut: "2026-12-05",
        guests: 0,
      },
      { abortEarly: false, convert: true },
    );
    expect(error).toBeDefined();
  });

  it("rejects a malformed roomId", () => {
    const { error } = createReservationSchema.validate(
      {
        roomId: "not-a-real-id",
        checkIn: "2026-12-01",
        checkOut: "2026-12-05",
        guests: 1,
      },
      { abortEarly: false, convert: true },
    );
    expect(error).toBeDefined();
    expect(error.details.some((d) => d.path.includes("roomId"))).toBe(true);
  });

  it("accepts a well-formed payload", () => {
    const { error, value } = createReservationSchema.validate(
      {
        roomId: "507f1f77bcf86cd799439011",
        checkIn: "2026-12-01",
        checkOut: "2026-12-05",
        guests: 2,
      },
      { abortEarly: false, convert: true },
    );
    expect(error).toBeUndefined();
    expect(value.guests).toBe(2);
  });
});

describe("Reservation id param validation", () => {
  it("rejects a non-ObjectId in /reservations/:id", async () => {
    const res = await request(app)
      .get("/api/v1/reservations/not-real")
      .set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a non-ObjectId in /reservations/:id/cancel", async () => {
    const res = await request(app)
      .patch("/api/v1/reservations/not-real/cancel")
      .set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(422);
  });

  it("rejects a non-ObjectId in /reservations/:id/timeline", async () => {
    const res = await request(app)
      .get("/api/v1/reservations/not-real/timeline")
      .set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(422);
  });
});
