import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "../routes/authRoutes.js";
import productRoutes from "../routes/productRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import reportRoutes from "../routes/reportRoutes.js";
import uploadRoutes from "../routes/uploadRoutes.js";
import categoryRoutes from "../routes/categoryRoutes.js";
import brandRoutes from "../routes/brandRoutes.js";
import staffRoutes from "../routes/staffRoutes.js";
import aboutRoutes from "../routes/aboutRoutes.js";
import contactRoutes from "../routes/contactRoutes.js";
import privacyRoutes from "../routes/privacyRoutes.js";
import cmsRoutes from "../routes/cmsRoutes.js";
import inquiryRoutes from "../routes/inquiryRoutes.js";
import { env } from "./config/env.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/aboutus", aboutRoutes);
app.use("/api/contactus", contactRoutes);
app.use("/api/privacy", privacyRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/inquiries", inquiryRoutes);

const root = path.resolve();
app.use("/uploads", express.static(path.join(root, "/uploads")));

app.get("/", (_req, res) => {
  res.send("API is running...");
});

export default app;
