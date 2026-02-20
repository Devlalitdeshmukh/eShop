import pool from "../config/db.js";

export const getBrands = async (req, res) => {
  try {
    const [brands] = await pool.query("SELECT * FROM brands ORDER BY name ASC");
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBrand = async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.query("INSERT INTO brands (name) VALUES (?)", [
      name,
    ]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBrand = async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query("UPDATE brands SET name = ? WHERE id = ?", [
      name,
      req.params.id,
    ]);
    res.json({ id: req.params.id, name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    await pool.query("DELETE FROM brands WHERE id = ?", [req.params.id]);
    res.json({ message: "Brand removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
