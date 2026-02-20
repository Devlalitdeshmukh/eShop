import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const id = 2; // Admin user ID
const token = jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
  expiresIn: "30d",
});

console.log(token);
