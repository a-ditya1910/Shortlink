// process.env is safe to read here because server.ts loads dotenv before importing this

const env = {
  port: parseInt(process.env.PORT || "4000"),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "mysql://appuser:apppass123@localhost:3307/shortlink",
  databaseSsl: process.env.DATABASE_SSL === "true",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwtSecret: process.env.JWT_SECRET || "dev_secret_replace_before_deploying",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  appUrl: process.env.APP_URL || "http://localhost:4000",
}

export default env
