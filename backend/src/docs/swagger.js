import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { env } from "../config/env.js";

const spec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Hotel Booking API",
      version: "1.0.0",
      description:
        "Academic hotel booking project API. See /docs/API_PLAN.md for the contract.",
    },
    servers: [{ url: `http://localhost:${env.port}/api/v1` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "VALIDATION_ERROR" },
                message: { type: "string", example: "Validation failed" },
                details: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: { type: "string", example: "email" },
                      message: {
                        type: "string",
                        example: "must be a valid email",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "68138b79f50f803fba1795b0" },
            name: { type: "string", example: "Alice" },
            email: { type: "string", example: "alice@example.com" },
            phone: { type: "string", nullable: true, example: "+201000000000" },
            role: { type: "string", example: "user" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                user: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
        HotelSummary: {
          type: "object",
          properties: {
            id: { type: "string", example: "68138beef50f803fba1795db" },
            name: { type: "string", example: "Bayview Boutique" },
            city: { type: "string", example: "Lisbon" },
            country: { type: "string", example: "Portugal" },
            starRating: { type: "number", example: 4 },
            amenities: {
              type: "array",
              items: { type: "string" },
              example: ["wifi", "breakfast"],
            },
            priceFrom: { type: "number", example: 90 },
            reviewAvg: { type: "number", example: 4.6 },
            reviewCount: { type: "number", example: 21 },
            thumbnail: { type: "string", nullable: true },
          },
        },
        Reservation: {
          type: "object",
          properties: {
            id: { type: "string", example: "68138cdef50f803fba1796aa" },
            user: { type: "string", example: "68138b79f50f803fba1795b0" },
            hotel: { type: "string", example: "68138beef50f803fba1795db" },
            room: { type: "string", example: "68138c10f50f803fba179630" },
            checkIn: { type: "string", format: "date", example: "2026-06-01" },
            checkOut: { type: "string", format: "date", example: "2026-06-04" },
            guests: { type: "number", example: 2 },
            nights: { type: "number", example: 3 },
            totalPrice: { type: "number", example: 420 },
            status: { type: "string", example: "active" },
          },
        },
      },
    },
  },
  apis: ["src/routes/**/*.js", "src/controllers/**/*.js"],
});

export function mountSwagger(app, basePath = "/api/docs") {
  app.use(basePath, swaggerUi.serve, swaggerUi.setup(spec));
  app.get(`${basePath}.json`, (_req, res) => res.json(spec));
}
