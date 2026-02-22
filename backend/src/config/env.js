import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "../..");

const runtimeEnv = (process.env.NODE_ENV || "local").toLowerCase();
const envFileMap = {
  local: ".env.local",
  development: ".env.development",
  production: ".env.production",
};

const selectedFile = envFileMap[runtimeEnv] || ".env.local";
const selectedPath = path.join(backendRoot, selectedFile);
const fallbackPath = path.join(backendRoot, ".env");

if (fs.existsSync(selectedPath)) {
  dotenv.config({ path: selectedPath });
} else if (fs.existsSync(fallbackPath)) {
  dotenv.config({ path: fallbackPath });
} else {
  dotenv.config();
}

export const env = {
  NODE_ENV: runtimeEnv,
  PORT: Number(process.env.PORT || 5000),
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "eshops",
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  ADMIN_EMAIL_PASS: process.env.ADMIN_EMAIL_PASS || "",
  REDIS_URL: process.env.REDIS_URL || "",
  REDIS_ENABLED: String(process.env.REDIS_ENABLED || "false").toLowerCase() === "true",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
};

export default env;
