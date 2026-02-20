import pool from "../config/db.js";

export const getPrivacyPolicy = async (req, res) => {
  try {
    const [policy] = await pool.query(
      "SELECT * FROM privacy_policy ORDER BY updated_at DESC LIMIT 1",
    );
    if (policy.length === 0) {
      return res.json({ content: "" });
    }
    res.json(policy[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePrivacyPolicy = async (req, res) => {
  const { content } = req.body;
  console.log("Updating privacy policy... Content length:", content?.length);
  try {
    // Check if policy exists
    const [existing] = await pool.query("SELECT * FROM privacy_policy LIMIT 1");

    if (existing.length === 0) {
      console.log("No existing policy, inserting new...");
      const [result] = await pool.query(
        "INSERT INTO privacy_policy (content) VALUES (?)",
        [content],
      );
      console.log("Inserted new policy, ID:", result.insertId);
      res.status(201).json({ id: result.insertId, content });
    } else {
      console.log("Existing policy found, updating ID:", existing[0].id);
      await pool.query(
        "UPDATE privacy_policy SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [content, existing[0].id],
      );
      console.log("Updated existing policy.");
      res.json({ id: existing[0].id, content });
    }
  } catch (error) {
    console.error("Privacy Policy Update Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
