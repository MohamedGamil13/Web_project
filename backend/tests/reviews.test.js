import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import { env } from "../src/config/env.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../src/validators/reviews.validators.js";

const userToken = () =>
  jwt.sign({ sub: "507f1f77bcf86cd799439011", role: "user" }, env.jwtSecret);

describe("Auth gating on review routes", () => {
  it("POST /hotels/:id/reviews requires a token", async () => {
    const res = await request(app)
      .post("/api/v1/hotels/507f1f77bcf86cd799439012/reviews")
      .send({ rating: 5 });
    expect(res.status).toBe(401);
  });

  it("GET /hotels/:id/reviews/me requires a token", async () => {
    const res = await request(app).get(
      "/api/v1/hotels/507f1f77bcf86cd799439012/reviews/me",
    );
    expect(res.status).toBe(401);
  });

  it("PATCH /reviews/:id requires a token", async () => {
    const res = await request(app)
      .patch("/api/v1/reviews/507f1f77bcf86cd799439013")
      .send({ rating: 4 });
    expect(res.status).toBe(401);
  });

  it("DELETE /reviews/:id requires a token", async () => {
    const res = await request(app).delete(
      "/api/v1/reviews/507f1f77bcf86cd799439013",
    );
    expect(res.status).toBe(401);
  });
});

describe("GET /hotels/:id/reviews — public, query validation", () => {
  it("rejects unknown sort with 422", async () => {
    const res = await request(app)
      .get("/api/v1/hotels/507f1f77bcf86cd799439012/reviews")
      .query({ sort: "random" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects pageSize > 50 with 422", async () => {
    const res = await request(app)
      .get("/api/v1/hotels/507f1f77bcf86cd799439012/reviews")
      .query({ pageSize: 200 });
    expect(res.status).toBe(422);
  });

  it("rejects a non-ObjectId hotel id with 422", async () => {
    const res = await request(app).get("/api/v1/hotels/not-real/reviews");
    expect(res.status).toBe(422);
  });
});

describe("POST /hotels/:id/reviews — body validation", () => {
  it("rejects missing rating", async () => {
    const res = await request(app)
      .post("/api/v1/hotels/507f1f77bcf86cd799439012/reviews")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ comment: "Nice" });
    expect(res.status).toBe(422);
    expect(res.body.error.details.some((d) => d.field === "rating")).toBe(true);
  });

  it("rejects rating out of range", async () => {
    const res = await request(app)
      .post("/api/v1/hotels/507f1f77bcf86cd799439012/reviews")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ rating: 6 });
    expect(res.status).toBe(422);
  });

  it("rejects a non-integer rating", async () => {
    const { error } = createReviewSchema.validate(
      { rating: 4.5 },
      { convert: true },
    );
    expect(error).toBeDefined();
  });

  it("rejects a comment over 1000 chars", async () => {
    const big = "x".repeat(1001);
    const { error } = createReviewSchema.validate(
      { rating: 5, comment: big },
      { convert: true },
    );
    expect(error).toBeDefined();
    expect(error.details.some((d) => d.path.includes("comment"))).toBe(true);
  });

  it("accepts a well-formed payload", () => {
    const { error, value } = createReviewSchema.validate(
      { rating: 4, comment: "Solid" },
      { convert: true },
    );
    expect(error).toBeUndefined();
    expect(value.rating).toBe(4);
  });
});

describe("PATCH /reviews/:id — validation", () => {
  it("rejects an empty body with 422", async () => {
    const res = await request(app)
      .patch("/api/v1/reviews/507f1f77bcf86cd799439013")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({});
    expect(res.status).toBe(422);
  });

  it("rejects an invalid review id with 422", async () => {
    const res = await request(app)
      .patch("/api/v1/reviews/not-real")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ rating: 5 });
    expect(res.status).toBe(422);
  });

  it("updateReviewSchema accepts a partial body", () => {
    const { error } = updateReviewSchema.validate(
      { rating: 3 },
      { convert: true },
    );
    expect(error).toBeUndefined();
  });
});

describe("DELETE /reviews/:id — validation", () => {
  it("rejects an invalid id with 422", async () => {
    const res = await request(app)
      .delete("/api/v1/reviews/not-real")
      .set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(422);
  });
});
