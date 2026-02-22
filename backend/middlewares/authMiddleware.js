import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const normalizeRole = (role) => (role || "").toString().trim().toUpperCase();

const allowedRoleAliases = {
  COMPANY: "STAFF",
};

const toCanonicalRole = (role) => {
  const normalized = normalizeRole(role);
  return allowedRoleAliases[normalized] || normalized;
};

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
      req.user = {
        ...rows[0],
        role: normalizeRole(rows[0].role),
        roleCanonical: toCanonicalRole(rows[0].role),
      };
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

export const optionalProtect = async (req, _res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
      const [rows] = await pool.query(
        "SELECT id, name, email, role FROM users WHERE id = ?",
        [decoded.id]
      );
      if (rows.length > 0) {
        req.user = {
          ...rows[0],
          role: normalizeRole(rows[0].role),
          roleCanonical: toCanonicalRole(rows[0].role),
        };
      }
    } catch {
      // Ignore invalid token for optional auth flow.
    }
  }
  next();
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  const allowed = new Set(roles.map((r) => toCanonicalRole(r)));
  const userRole = req.user?.roleCanonical || toCanonicalRole(req.user?.role);

  if (req.user && allowed.has(userRole)) {
    return next();
  }

  return res.status(403).json({ message: "Not authorized for this resource" });
};

export const adminOnly = authorizeRoles("ADMIN");
export const adminOrStaff = authorizeRoles("ADMIN", "STAFF", "COMPANY");
export const staffOnly = authorizeRoles("STAFF", "COMPANY");
export const customerOnly = authorizeRoles("CUSTOMER");

// Backward-compatible export used by existing route files.
export const admin = adminOnly;
