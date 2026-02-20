import pool from "../config/db.js";

export const getProducts = async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, b.name as brand, c.name as category 
      FROM products p 
      LEFT JOIN brands b ON p.brand_id = b.id 
      LEFT JOIN categories c ON p.category_id = c.id
    `);
    const formatted = products.map((p) => ({
      id: p.id.toString(),
      name: p.name,
      category: p.category,
      brand: p.brand,
      price: parseFloat(p.price),
      discountPrice: p.discount_price
        ? parseFloat(p.discount_price)
        : undefined,
      description: p.description,
      image: p.image,
      rating: parseFloat(p.rating),
      reviews: p.numReviews,
      stock: p.stock,
      isSpicy: Boolean(p.is_spicy),
      expiryDate: p.expiry_date
        ? new Date(p.expiry_date).toISOString().split("T")[0]
        : null,
    }));
    res.json(formatted);
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
      res.json({
        id: p.id.toString(),
        name: p.name,
        category: p.category,
        brand: p.brand,
        price: parseFloat(p.price),
        discountPrice: p.discount_price
          ? parseFloat(p.discount_price)
          : undefined,
        description: p.description,
        image: p.image,
        rating: parseFloat(p.rating),
        reviews: p.numReviews,
        stock: p.stock,
        isSpicy: Boolean(p.is_spicy),
        expiryDate: p.expiry_date
          ? new Date(p.expiry_date).toISOString().split("T")[0]
          : null,
      });
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
      "INSERT INTO products (name, brand_id, category_id, price, discount_price, description, image, stock, is_spicy, expiry_date, rating, numReviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
      ]
    );
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
      "UPDATE products SET name=?, brand_id=?, category_id=?, price=?, discount_price=?, description=?, image=?, stock=?, is_spicy=?, expiry_date=? WHERE id=?",
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
        req.params.id,
      ]
    );
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};