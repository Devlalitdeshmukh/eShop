import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.role, u.created_at,
        COUNT(o.id) as totalOrders,
        IFNULL(SUM(o.totalPrice), 0) as totalAmount
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const [users] = await pool.query(
      `
      SELECT 
        u.id, u.name, u.email, u.mobile, u.gender, u.role, u.isAdmin, u.created_at,
        COUNT(DISTINCT o.id) as totalOrders,
        IFNULL(SUM(o.totalPrice), 0) as totalAmount
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `,
      [req.params.id],
    );

    if (users.length > 0) {
      // Fetch user orders
      const [userOrders] = await pool.query(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
        [req.params.id],
      );

      // Fetch user reviews with product details
      const [userReviews] = await pool.query(
        `SELECT 
          r.id,
          r.rating,
          r.comment,
          r.created_at,
          p.id as product_id,
          p.name as product_name,
          p.image as product_image
        FROM reviews r
        JOIN products p ON r.product_id = p.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC`,
        [req.params.id],
      );

      res.json({
        ...users[0],
        orders: userOrders,
        reviews: userReviews,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, mobile, gender, role, isAdmin, created_at FROM users WHERE id = ?",
      [req.user.id],
    );

    if (users.length > 0) {
      const user = users[0];

      // Get additional stats
      const [orderStats] = await pool.query(
        "SELECT COUNT(*) as totalOrders FROM orders WHERE user_id = ?",
        [req.user.id],
      );

      // Count unique shipping addresses from orders as "Saved Addresses"
      const [addresses] = await pool.query(
        "SELECT shippingAddress FROM orders WHERE user_id = ?",
        [req.user.id],
      );

      const uniqueAddresses = new Set(
        addresses
          .map((a) =>
            a.shippingAddress ? JSON.stringify(a.shippingAddress) : null,
          )
          .filter(Boolean),
      );

      res.json({
        ...user,
        totalOrders: orderStats[0].totalOrders,
        savedAddresses: uniqueAddresses.size,
        accountStatus: "Active",
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);

    if (users.length > 0) {
      const user = users[0];
      const { name, email, password, mobile, gender } = req.body;

      let query =
        "UPDATE users SET name = ?, email = ?, mobile = ?, gender = ?";
      let params = [
        name || user.name,
        email || user.email,
        mobile || user.mobile,
        gender || user.gender,
      ];

      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        query += ", password = ?";
        params.push(hashedPassword);
      }

      query += " WHERE id = ?";
      params.push(req.user.id);

      await pool.query(query, params);

      const [updatedUser] = await pool.query(
        "SELECT id, name, email, mobile, gender, role, isAdmin, created_at FROM users WHERE id = ?",
        [req.user.id],
      );

      res.json(updatedUser[0]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateUser = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);

    if (users.length > 0) {
      const user = users[0];
      const { name, email, role, mobile, gender } = req.body;

      const query =
        "UPDATE users SET name = ?, email = ?, role = ?, mobile = ?, gender = ? WHERE id = ?";
      const params = [
        name || user.name,
        email || user.email,
        role || user.role,
        mobile || user.mobile,
        gender || user.gender,
        req.params.id,
      ];

      await pool.query(query, params);

      const [updatedUser] = await pool.query(
        "SELECT id, name, email, mobile, gender, role, isAdmin, created_at FROM users WHERE id = ?",
        [req.params.id],
      );

      res.json(updatedUser[0]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
