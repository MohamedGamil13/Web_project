import request from "supertest";
import app from "../src/app.js";

describe("GET /api/v1/health", () => {
  it("returns success envelope with status ok", async () => {
    const response = await request(app).get("/api/v1/health");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
    expect(response.body.data).toHaveProperty("uptime");
    expect(response.body.data).toHaveProperty("db");
  });
});

describe("Unknown routes", () => {
  it("returns a 404 with the error envelope", async () => {
    const response = await request(app).get("/api/v1/does-not-exist");
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });
});
