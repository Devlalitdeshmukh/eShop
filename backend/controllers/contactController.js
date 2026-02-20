import pool from "../config/db.js";

export const getContactus = async (req, res) => {
  try {
    const [contactus] = await pool.query("SELECT * FROM contactus");
    res.json(contactus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getContactusById = async (req, res) => {
  try {
    const [contactus] = await pool.query(
      "SELECT * FROM contactus WHERE id = ?",
      [req.params.id],
    );
    if (contactus.length === 0) {
      return res.status(404).json({ message: "Contact Us entry not found" });
    }
    res.json(contactus[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createContactus = async (req, res) => {
  const {
    title,
    description,
    email,
    phone,
    address,
    instagram,
    facebook,
    linkedin,
  } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO contactus (title, description, email, phone, address, instagram, facebook, linkedin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        description,
        email,
        phone,
        address,
        instagram,
        facebook,
        linkedin,
      ],
    );
    res.status(201).json({
      id: result.insertId,
      title,
      description,
      email,
      phone,
      address,
      instagram,
      facebook,
      linkedin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateContactus = async (req, res) => {
  const {
    title,
    description,
    email,
    phone,
    address,
    instagram,
    facebook,
    linkedin,
  } = req.body;
  try {
    await pool.query(
      "UPDATE contactus SET title = ?, description = ?, email = ?, phone = ?, address = ?, instagram = ?, facebook = ?, linkedin = ? WHERE id = ?",
      [
        title,
        description,
        email,
        phone,
        address,
        instagram,
        facebook,
        linkedin,
        req.params.id,
      ],
    );
    res.json({
      id: req.params.id,
      title,
      description,
      email,
      phone,
      address,
      instagram,
      facebook,
      linkedin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteContactus = async (req, res) => {
  try {
    await pool.query("DELETE FROM contactus WHERE id = ?", [req.params.id]);
    res.json({ message: "Contact Us entry removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
