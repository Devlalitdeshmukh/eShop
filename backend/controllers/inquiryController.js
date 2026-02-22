import pool from "../config/db.js";
import { sendAdminInquiryMail } from "../utils/mailer.js";
import { buildPaginatedResponse, parsePagination } from "../utils/pagination.js";

const ALLOWED_TYPES = new Set(["Product", "Delivery", "Price", "Other"]);
const ALLOWED_STATUS = new Set(["New", "Working", "Resolved", "Completed"]);

export const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, inquiry_type, product_id, message } = req.body;

    if (!name || !email || !inquiry_type || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!ALLOWED_TYPES.has(inquiry_type)) {
      return res.status(400).json({ message: "Invalid inquiry type" });
    }

    const productId = product_id ? Number(product_id) : null;

    const [result] = await pool.query(
      `INSERT INTO inquiries
       (user_id, name, email, phone, inquiry_type, product_id, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'New')`,
      [
        req.user?.id || null,
        name.trim(),
        email.trim().toLowerCase(),
        phone ? String(phone).trim() : null,
        inquiry_type,
        Number.isFinite(productId) ? productId : null,
        message.trim(),
      ]
    );

    try {
      await sendAdminInquiryMail({
        name,
        email,
        phone,
        inquiry_type,
        message,
      });
    } catch (mailError) {
      console.warn("Inquiry mail failed:", mailError.message);
    }

    return res.status(201).json({
      message: "Inquiry submitted successfully",
      id: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getInquiries = async (req, res) => {
  try {
    const { status, inquiry_type, q } = req.query;
    const { hasPagination, page, limit, offset } = parsePagination(req.query, {
      page: 1,
      limit: 10,
      maxLimit: 100,
    });

    let sql = `
      SELECT i.*, p.name AS product_name, u.name AS user_name
      FROM inquiries i
      LEFT JOIN products p ON i.product_id = p.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let countSql = "SELECT COUNT(*) AS total FROM inquiries i WHERE 1=1";
    const countParams = [];

    if (status && ALLOWED_STATUS.has(String(status))) {
      sql += " AND i.status = ?";
      params.push(status);
      countSql += " AND i.status = ?";
      countParams.push(status);
    }

    if (inquiry_type && ALLOWED_TYPES.has(String(inquiry_type))) {
      sql += " AND i.inquiry_type = ?";
      params.push(inquiry_type);
      countSql += " AND i.inquiry_type = ?";
      countParams.push(inquiry_type);
    }

    if (q) {
      sql += " AND (i.name LIKE ? OR i.email LIKE ? OR i.message LIKE ?)";
      const term = `%${q}%`;
      params.push(term, term, term);
      countSql += " AND (i.name LIKE ? OR i.email LIKE ? OR i.message LIKE ?)";
      countParams.push(term, term, term);
    }

    sql += ` ORDER BY i.created_at DESC${hasPagination ? " LIMIT ? OFFSET ?" : ""}`;
    if (hasPagination) {
      params.push(limit, offset);
    }

    const [rows] = await pool.query(sql, params);
    if (!hasPagination) {
      return res.json(rows);
    }

    const [[countRow]] = await pool.query(countSql, countParams);
    return res.json(
      buildPaginatedResponse({
        rows,
        total: Number(countRow.total || 0),
        page,
        limit,
      })
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!ALLOWED_STATUS.has(String(status))) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const [result] = await pool.query("UPDATE inquiries SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    return res.json({ message: "Inquiry status updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
