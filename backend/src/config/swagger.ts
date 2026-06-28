import swaggerJsdoc from "swagger-jsdoc"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ShortLink API",
      version: "1.0.0",
      description: "URL shortener — shorten links, track clicks, view analytics",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
}

export const swaggerSpec = swaggerJsdoc(options)
