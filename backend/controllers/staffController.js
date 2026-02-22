import pool from "../config/db.js";

const normalizeRole = (role) => (role || "").toString().trim().toUpperCase();
const isAdmin = (role) => normalizeRole(role) === "ADMIN";
const isStaffRole = (role) =>
  ["STAFF", "COMPANY"].includes(normalizeRole(role));
const isPrivileged = (role) => isAdmin(role) || isStaffRole(role);

const resolveScopedUserId = (req, requestedUserId) => {
  const currentUserId = Number(req.user?.id);
  const requested = requestedUserId ? Number(requestedUserId) : currentUserId;

  if (!isPrivileged(req.user?.role) && requested !== currentUserId) {
    return null;
  }

  return requested;
};

// ============ ATTENDANCE ============

export const markAttendance = async (req, res) => {
  const { user_id, date, check_in, check_out, status, notes, working_hours } =
    req.body;

  try {
    const scopedUserId = resolveScopedUserId(req, user_id);
    if (!scopedUserId) {
      return res.status(403).json({ message: "Not authorized for this user" });
    }

    const allowedStatuses = ["Present", "Absent", "Half Day", "Late"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid attendance status" });
    }

    const [result] = await pool.query(
      `INSERT INTO staff_attendance (user_id, date, check_in, check_out, status, notes, working_hours) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       check_in = VALUES(check_in), 
       check_out = VALUES(check_out), 
       status = VALUES(status), 
       notes = VALUES(notes),
       working_hours = VALUES(working_hours)`,
      [scopedUserId, date, check_in, check_out, status, notes, working_hours],
    );

    res.json({
      message: "Attendance marked successfully",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendance = async (req, res) => {
  const { user_id, start_date, end_date } = req.query;

  try {
    const scopedUserId = resolveScopedUserId(req, user_id);
    if (!scopedUserId) {
      return res.status(403).json({ message: "Not authorized for this user" });
    }

    let query = `
      SELECT a.*, u.name as user_name, u.email 
      FROM staff_attendance a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (isAdmin(req.user?.role) && user_id) {
      query += ` AND a.user_id = ?`;
      params.push(scopedUserId);
    } else {
      query += ` AND a.user_id = ?`;
      params.push(scopedUserId);
    }

    if (start_date && end_date) {
      query += ` AND a.date BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    }

    query += ` ORDER BY a.date DESC, a.user_id`;

    const [attendance] = await pool.query(query, params);
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendanceStats = async (req, res) => {
  const { user_id, month, year } = req.query;

  try {
    const scopedUserId = resolveScopedUserId(req, user_id);
    if (!scopedUserId) {
      return res.status(403).json({ message: "Not authorized for this user" });
    }

    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'Half Day' THEN 0.5 ELSE 0 END) as half_days,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late_days
      FROM staff_attendance
      WHERE user_id = ? 
      AND MONTH(date) = ? 
      AND YEAR(date) = ?`,
      [scopedUserId, month, year],
    );

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ LEAVES ============

export const applyLeave = async (req, res) => {
  const {
    user_id,
    leave_name,
    work_handover_to,
    start_date,
    from_leave_type,
    end_date,
    to_leave_type,
    leave_reason,
    notes,
    document_url,
  } = req.body;

  try {
    const scopedUserId = resolveScopedUserId(req, user_id);
    if (!scopedUserId) {
      return res.status(403).json({ message: "Not authorized for this user" });
    }

    const [result] = await pool.query(
      `INSERT INTO staff_leaves (user_id, leave_name, work_handover_to, start_date, from_leave_type, end_date, to_leave_type, leave_reason, notes, document_url, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        scopedUserId,
        leave_name,
        work_handover_to,
        start_date,
        from_leave_type,
        end_date,
        to_leave_type,
        leave_reason,
        notes,
        document_url,
      ],
    );

    res
      .status(201)
      .json({
        message: "Leave application submitted successfully",
        id: result.insertId,
      });
  } catch (error) {
    console.error("Apply Leave Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getLeaves = async (req, res) => {
  const { user_id, status } = req.query;

  try {
    const scopedUserId = resolveScopedUserId(req, user_id);
    if (!scopedUserId) {
      return res.status(403).json({ message: "Not authorized for this user" });
    }

    let query = `
      SELECT l.*, 
        u.name as user_name, 
        u.email,
        approver.name as approved_by_name
      FROM staff_leaves l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN users approver ON l.approved_by = approver.id
      WHERE 1=1
    `;
    const params = [];

    if (isAdmin(req.user?.role) && user_id) {
      query += ` AND l.user_id = ?`;
      params.push(scopedUserId);
    } else {
      query += ` AND l.user_id = ?`;
      params.push(scopedUserId);
    }

    if (status) {
      query += ` AND l.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY l.created_at DESC`;

    const [leaves] = await pool.query(query, params);
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const allowedStatuses = ["Pending", "Approved", "Rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid leave status" });
    }

    const [result] = await pool.query(
      `UPDATE staff_leaves 
       SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [status, req.user.id, id],
    );

    if (result.affectedRows > 0) {
      res.json({ message: "Leave status updated successfully" });
    } else {
      res.status(404).json({ message: "Leave not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaveBalance = async (req, res) => {
  const { user_id, year } = req.query;

  try {
    const scopedUserId = resolveScopedUserId(req, user_id);
    if (!scopedUserId) {
      return res.status(403).json({ message: "Not authorized for this user" });
    }

    const [balance] = await pool.query(
      `SELECT * FROM leave_balance WHERE user_id = ? AND year = ?`,
      [scopedUserId, year || new Date().getFullYear()],
    );

    if (balance.length > 0) {
      res.json(balance[0]);
    } else {
      // Create default balance for the year
      const currentYear = year || new Date().getFullYear();
      const [result] = await pool.query(
        `INSERT INTO leave_balance (user_id, year) VALUES (?, ?)`,
        [scopedUserId, currentYear],
      );

      const [newBalance] = await pool.query(
        `SELECT * FROM leave_balance WHERE id = ?`,
        [result.insertId],
      );

      res.json(newBalance[0]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ HOLIDAYS ============

export const getHolidays = async (req, res) => {
  const { year } = req.query;

  try {
    let query = `SELECT * FROM holidays`;
    const params = [];

    if (year) {
      query += ` WHERE YEAR(date) = ?`;
      params.push(year);
    }

    query += ` ORDER BY date ASC`;

    const [holidays] = await pool.query(query, params);
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHoliday = async (req, res) => {
  const { name, date, description, is_optional } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO holidays (name, date, description, is_optional) 
       VALUES (?, ?, ?, ?)`,
      [name, date, description, is_optional || false],
    );

    res
      .status(201)
      .json({ message: "Holiday created successfully", id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHoliday = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(`DELETE FROM holidays WHERE id = ?`, [id]);
    res.json({ message: "Holiday deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ WORKING HOURS ============

export const getWorkingHours = async (req, res) => {
  const { user_id } = req.query;

  try {
    const [hours] = await pool.query(
      `SELECT * FROM working_hours WHERE user_id = ? ORDER BY 
       FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`,
      [user_id],
    );

    res.json(hours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setWorkingHours = async (req, res) => {
  const { user_id, day_of_week, start_time, end_time, is_working_day } =
    req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO working_hours (user_id, day_of_week, start_time, end_time, is_working_day) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       start_time = VALUES(start_time), 
       end_time = VALUES(end_time), 
       is_working_day = VALUES(is_working_day)`,
      [user_id, day_of_week, start_time, end_time, is_working_day],
    );

    res.json({ message: "Working hours updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
