import pool from "../config/db.js";

export const getAboutus = async (req, res) => {
  try {
    const [aboutus] = await pool.query("SELECT * FROM about");
    res.json(aboutus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAboutusById = async (req, res) => {
  try {
    const [aboutus] = await pool.query("SELECT * FROM about WHERE id = ?", [
      req.params.id,
    ]);
    if (aboutus.length === 0) {
      return res.status(404).json({ message: "About Us entry not found" });
    }
    res.json(aboutus[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAboutus = async (req, res) => {
  const { title, description } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO about (title, description, created_at, updated_at) VALUES (?, ?, ?, ?)",
      [title, description, new Date(), new Date()]
    );
    res.status(201).json({ id: result.insertId, title, description });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAboutus = async (req, res) => {
  const { title, description } = req.body;
  try {
    await pool.query(
      "UPDATE about SET title = ?, description = ?, updated_at = ? WHERE id = ?",
      [title, description, new Date(), req.params.id]
    );
    res.json({ id: req.params.id, title, description });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAboutus = async (req, res) => {
  try {
    await pool.query("DELETE FROM about WHERE id = ?", [req.params.id]);
    res.json({ message: "About Us entry removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
