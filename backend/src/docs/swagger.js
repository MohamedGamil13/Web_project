import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { env } from "../config/env.js";

const spec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Hotel Booking API",
      version: "1.0.0",
      description: "Hotel Booking API. See /docs/API_PLAN.md for the contract.",
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
            role: {
              type: "string",
              enum: ["owner", "admin", "user"],
              example: "user",
            },
          },
        },
        PermissionProfile: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/User" },
            basePermissions: {
              type: "array",
              items: { type: "string" },
            },
            overrides: {
              type: "object",
              properties: {
                allow: { type: "array", items: { type: "string" } },
                deny: { type: "array", items: { type: "string" } },
              },
            },
            effectivePermissions: {
              type: "array",
              items: { type: "string" },
            },
            availablePermissions: {
              type: "array",
              items: { type: "string" },
            },
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
            pricing: {
              type: "object",
              properties: {
                subtotal: { type: "number", example: 360 },
                serviceFee: { type: "number", example: 28.8 },
                taxAmount: { type: "number", example: 54.43 },
                total: { type: "number", example: 443.23 },
                rules: {
                  type: "object",
                  properties: {
                    serviceFeeRate: { type: "number", example: 0.08 },
                    taxRate: { type: "number", example: 0.14 },
                  },
                },
              },
            },
            status: { type: "string", example: "active" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: { type: "string", example: "68138cdef50f803fba1796aa" },
            userId: { type: "string", example: "68138b79f50f803fba1795b0" },
            type: {
              type: "string",
              example: "reservation_created",
              enum: [
                "reservation_created",
                "reservation_updated",
                "reservation_cancelled",
              ],
            },
            title: { type: "string", example: "Reservation confirmed" },
            message: {
              type: "string",
              example: "Your reservation was created for 2026-06-01 to 2026-06-04.",
            },
            readAt: {
              type: "string",
              nullable: true,
              example: null,
            },
            payload: {
              type: "object",
              properties: {
                reservationId: {
                  type: "string",
                  example: "68138cdef50f803fba1796aa",
                },
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-05-16T18:35:00.000Z",
            },
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
