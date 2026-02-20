import pool from "../config/db.js";

export const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;
  const userId = req.user.id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if user already reviewed
    const [existing] = await connection.query(
      "SELECT * FROM reviews WHERE product_id = ? AND user_id = ?",
      [productId, userId]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ message: "Product already reviewed" });
    }

    // Insert Review
    await connection.query(
      "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
      [productId, userId, rating, comment]
    );

    // Calculate new average and count
    const [stats] = await connection.query(
      "SELECT AVG(rating) as avgRating, COUNT(*) as numReviews FROM reviews WHERE product_id = ?",
      [productId]
    );

    const newRating = stats[0].avgRating || 0;
    const newReviews = stats[0].numReviews || 0;

    // Update Product Table
    await connection.query(
      "UPDATE products SET rating = ?, numReviews = ? WHERE id = ?",
      [newRating, newReviews, productId]
    );

    await connection.commit();
    res.status(201).json({
      message: "Review added",
      rating: newRating,
      reviews: newReviews,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ? 
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    const formatted = reviews.map((r) => ({
      id: r.id,
      userName: r.user_name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
