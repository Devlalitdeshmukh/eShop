import pool from "../config/db.js";

export const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT * FROM categories ORDER BY name ASC"
    );
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query("UPDATE categories SET name = ? WHERE id = ?", [
      name,
      req.params.id,
    ]);
    res.json({ id: req.params.id, name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await pool.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.json({ message: "Category removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
