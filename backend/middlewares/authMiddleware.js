import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received, verifying...");
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
      console.log("Token decoded, user id:", decoded.id);

      const [rows] = await pool.query(
        "SELECT id, name, email, role FROM users WHERE id = ?",
        [decoded.id]
      );

      if (rows.length === 0) {
        console.log("User not found in database for ID:", decoded.id);
        return res
          .status(401)
          .json({ message: "User not found. Please log in again." });
      }

      console.log("User authorized:", rows[0].email);
      req.user = rows[0];
      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.log("No Authorization header found");
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && (req.user.role === "ADMIN" || req.user.role === "COMPANY")) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};
