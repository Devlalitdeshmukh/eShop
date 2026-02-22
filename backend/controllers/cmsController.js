import pool from "../config/db.js";

const safeParseJson = (value, fallback = null) => {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const defaults = {
  bestSelling: {
    title: "Most & Best Selling Products",
  },
  seasonal: {
    title: "Most Popular This Season",
  },
  stats: [],
  testimonials: [],
};

export const getHomeContent = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT content_key, title, body
       FROM cms_content
       WHERE content_key IN ('home-best-selling', 'home-seasonal', 'home-stats', 'home-testimonials')
       AND is_active = 1`
    );

    const map = new Map(rows.map((r) => [r.content_key, r]));

    const bestSellingRow = map.get("home-best-selling");
    const seasonalRow = map.get("home-seasonal");
    const statsRow = map.get("home-stats");
    const testimonialsRow = map.get("home-testimonials");

    const payload = {
      bestSelling: {
        title: bestSellingRow?.title || defaults.bestSelling.title,
      },
      seasonal: {
        title: seasonalRow?.title || defaults.seasonal.title,
      },
      stats: safeParseJson(statsRow?.body, defaults.stats) || defaults.stats,
      testimonials:
        safeParseJson(testimonialsRow?.body, defaults.testimonials) || defaults.testimonials,
    };

    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const upsertHomeContent = async (req, res) => {
  try {
    const { key, title, body } = req.body;
    const allowed = new Set([
      "home-best-selling",
      "home-seasonal",
      "home-stats",
      "home-testimonials",
    ]);

    if (!allowed.has(key)) {
      return res.status(400).json({ message: "Invalid home content key" });
    }

    await pool.query(
      `INSERT INTO cms_content (content_key, content_type, title, body, is_active, created_by, updated_by)
       VALUES (?, 'STATIC_PAGE', ?, ?, 1, ?, ?)
       ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       body = VALUES(body),
       updated_by = VALUES(updated_by),
       is_active = 1`,
      [key, title || null, body || null, req.user.id, req.user.id]
    );

    return res.json({ message: "Home content saved" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
