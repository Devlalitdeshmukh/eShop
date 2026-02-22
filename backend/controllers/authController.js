import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password, mobile, gender } = req.body;

  try {
    const [userExists] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (userExists.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = "CUSTOMER";

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, mobile, gender, role) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, mobile, gender, userRole]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      mobile,
      gender,
      role: userRole,
      token: generateToken(result.insertId),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length > 0) {
      const user = rows[0];
      if (await bcrypt.compare(password, user.password)) {
        res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user.id),
        });
        return;
      }
    }

    res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
