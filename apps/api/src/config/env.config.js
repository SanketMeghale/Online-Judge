/**
 * Centralized Environment Configuration & Schema Validation
 * Manages environment variables for API Server, Database, RabbitMQ, and Socket.IO
 */

export const envConfig = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/online-judge",
  rabbitmqUrl: process.env.RABBITMQ_URL || "amqp://guest:guest@127.0.0.1:5672",
  jwtSecret: process.env.JWT_SECRET || "super-secret-online-judge-key",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:8080"
};
