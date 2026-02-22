import pool from "../config/db.js";
import { delCache, getCache, setCache } from "../utils/cache.js";
import { buildPaginatedResponse, parsePagination } from "../utils/pagination.js";

const toProductDto = (p) => ({
  id: p.id.toString(),
  name: p.name,
  category: p.category,
  brand: p.brand,
  price: parseFloat(p.price),
  discountPrice: p.discount_price ? parseFloat(p.discount_price) : undefined,
  description: p.description,
  image: p.image,
  rating: parseFloat(p.rating),
  reviews: p.numReviews,
  stock: p.stock,
  isSpicy: Boolean(p.is_spicy),
  expiryDate: p.expiry_date
    ? new Date(p.expiry_date).toISOString().split("T")[0]
    : null,
  isBestSelling: Boolean(p.is_best_selling),
  totalSales: Number(p.total_sales || 0),
  season: p.season || "All",
});

export const getProducts = async (req, res) => {
  try {
    const { hasPagination, page, limit, offset } = parsePagination(req.query, {
      page: 1,
      limit: 12,
      maxLimit: 100,
    });

    const [products] = await pool.query(
      `SELECT p.*, b.name as brand, c.name as category
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC${hasPagination ? " LIMIT ? OFFSET ?" : ""}`,
      hasPagination ? [limit, offset] : []
    );
    const formatted = products.map(toProductDto);

    if (!hasPagination) {
      return res.json(formatted);
    }

    const [[countRow]] = await pool.query("SELECT COUNT(*) AS total FROM products");
    return res.json(
      buildPaginatedResponse({
        rows: formatted,
        total: Number(countRow.total || 0),
        page,
        limit,
      })
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, b.name as brand, c.name as category 
      FROM products p 
      LEFT JOIN brands b ON p.brand_id = b.id 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [req.params.id]);
    if (products.length > 0) {
      const p = products[0];
      res.json(toProductDto(p));
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  const {
    name,
    category,
    brand,
    price,
    discountPrice,
    description,
    image,
    stock,
    isSpicy,
    expiryDate,
    isBestSelling,
    season,
  } = req.body;
  try {
    // First, try to find or create the brand
    let brandId;
    const [existingBrand] = await pool.query("SELECT id FROM brands WHERE name = ?", [brand]);
    if (existingBrand.length > 0) {
      brandId = existingBrand[0].id;
    } else {
      const [brandResult] = await pool.query("INSERT INTO brands (name) VALUES (?)", [brand]);
      brandId = brandResult.insertId;
    }

    // Then, try to find or create the category
    let categoryId;
    const [existingCategory] = await pool.query("SELECT id FROM categories WHERE name = ?", [category]);
    if (existingCategory.length > 0) {
      categoryId = existingCategory[0].id;
    } else {
      const [categoryResult] = await pool.query("INSERT INTO categories (name) VALUES (?)", [category]);
      categoryId = categoryResult.insertId;
    }

    const [result] = await pool.query(
      "INSERT INTO products (name, brand_id, category_id, price, discount_price, description, image, stock, is_spicy, expiry_date, rating, numReviews, is_best_selling, season) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        brandId,
        categoryId,
        price,
        discountPrice || null,
        description,
        image,
        stock,
        isSpicy ? 1 : 0,
        expiryDate || null,
        0,
        0,
        isBestSelling ? 1 : 0,
        season || "All",
      ]
    );
    await delCache(["products:best-selling", "products:season:all", "products:season:summer", "products:season:winter", "products:season:festival"]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const {
    name,
    category,
    brand,
    price,
    discountPrice,
    description,
    image,
    stock,
    isSpicy,
    expiryDate,
    isBestSelling,
    season,
  } = req.body;
  try {
    // First, try to find or create the brand
    let brandId;
    const [existingBrand] = await pool.query("SELECT id FROM brands WHERE name = ?", [brand]);
    if (existingBrand.length > 0) {
      brandId = existingBrand[0].id;
    } else {
      const [brandResult] = await pool.query("INSERT INTO brands (name) VALUES (?)", [brand]);
      brandId = brandResult.insertId;
    }

    // Then, try to find or create the category
    let categoryId;
    const [existingCategory] = await pool.query("SELECT id FROM categories WHERE name = ?", [category]);
    if (existingCategory.length > 0) {
      categoryId = existingCategory[0].id;
    } else {
      const [categoryResult] = await pool.query("INSERT INTO categories (name) VALUES (?)", [category]);
      categoryId = categoryResult.insertId;
    }

    await pool.query(
      "UPDATE products SET name=?, brand_id=?, category_id=?, price=?, discount_price=?, description=?, image=?, stock=?, is_spicy=?, expiry_date=?, is_best_selling=?, season=? WHERE id=?",
      [
        name,
        brandId,
        categoryId,
        price,
        discountPrice || null,
        description,
        image,
        stock,
        isSpicy ? 1 : 0,
        expiryDate || null,
        isBestSelling ? 1 : 0,
        season || "All",
        req.params.id,
      ]
    );
    await delCache(["products:best-selling", "products:season:all", "products:season:summer", "products:season:winter", "products:season:festival"]);
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    await delCache(["products:best-selling", "products:season:all", "products:season:summer", "products:season:winter", "products:season:festival"]);
    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBestSellingProducts = async (_req, res) => {
  try {
    const cacheKey = "products:best-selling";
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const [flagged] = await pool.query(
      `SELECT p.*, b.name as brand, c.name as category
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_best_selling = 1 AND p.is_active = 1
       ORDER BY p.total_sales DESC, p.rating DESC
       LIMIT 8`
    );

    let merged = [...flagged];

    if (merged.length < 8) {
      const ids = merged.map((p) => p.id);
      const [topSales] = await pool.query(
        `SELECT p.*, b.name as brand, c.name as category
         FROM products p
         LEFT JOIN brands b ON p.brand_id = b.id
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.is_active = 1 ${ids.length ? `AND p.id NOT IN (${ids.map(() => "?").join(",")})` : ""}
         ORDER BY p.total_sales DESC, p.rating DESC
         LIMIT ?`,
        [...ids, 8 - merged.length]
      );
      merged = [...merged, ...topSales];
    }

    const data = merged.map(toProductDto);
    await setCache(cacheKey, data, 300);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductsBySeason = async (req, res) => {
  try {
    const seasonRaw = (req.params.season || "All").trim();
    const season = seasonRaw.charAt(0).toUpperCase() + seasonRaw.slice(1).toLowerCase();
    const allowed = new Set(["All", "Summer", "Winter", "Festival"]);

    if (!allowed.has(season)) {
      return res.status(400).json({ message: "Invalid season filter" });
    }

    const cacheKey = `products:season:${season.toLowerCase()}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const params = [];
    const where =
      season === "All"
        ? "WHERE p.is_active = 1"
        : "WHERE p.is_active = 1 AND (p.season = ? OR p.season = 'All')";

    if (season !== "All") params.push(season);

    const [rows] = await pool.query(
      `SELECT p.*, b.name as brand, c.name as category
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY p.total_sales DESC, p.rating DESC
       LIMIT 12`,
      params
    );

    const data = rows.map(toProductDto);
    await setCache(cacheKey, data, 300);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setBestSellingStatus = async (req, res) => {
  try {
    const { isBestSelling } = req.body;
    await pool.query(
      "UPDATE products SET is_best_selling = ? WHERE id = ?",
      [isBestSelling ? 1 : 0, req.params.id]
    );

    await delCache(["products:best-selling", "products:season:all", "products:season:summer", "products:season:winter", "products:season:festival"]);
    res.json({ message: "Best-selling status updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductSalesAnalytics = async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.image,
        p.total_sales as totalSales,
        COALESCE(SUM(oi.qty * oi.price), 0) as revenue
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      GROUP BY p.id, p.name, p.image, p.total_sales
      ORDER BY p.total_sales DESC, revenue DESC
      LIMIT 20
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
