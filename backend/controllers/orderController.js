import pool from "../config/db.js";

export const createOrder = async (req, res) => {
  const { items, total, paymentMethod, shippingAddress } = req.body;
  const userId = req.user ? req.user.id : null;
  const orderNo = `ORD-${Date.now()}`;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Insert the order
    const [result] = await connection.query(
      "INSERT INTO orders (order_no, user_id, totalPrice, status, paymentMethod, shippingAddress) VALUES (?, ?, ?, ?, ?, ?)",
      [
        orderNo,
        userId,
        total,
        "Pending",
        paymentMethod,
        JSON.stringify(shippingAddress),
      ]
    );

    const orderId = result.insertId;

    // Process each item in the order and update inventory
    for (const item of items) {
      // Insert order item
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, name, qty, image, price, variant_id, variant_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          orderId,
          item.id,
          item.name,
          item.quantity,
          item.image,
          item.discountPrice || item.price,
          item.selectedVariantId || null,
          item.selectedVariantName || null,
        ]
      );

      // Update product stock
      await connection.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.id]
      );
    }

    await connection.commit();
    res.status(201).json({
      id: orderId,
      order_no: orderNo,
      status: "Pending",
      message: "Order placed successfully",
    });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    // Search by numeric ID or order_no string
    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE id = ? OR order_no = ?",
      [id, id]
    );

    if (orders.length > 0) {
      const order = orders[0];
      const [items] = await pool.query(
        "SELECT * FROM order_items WHERE order_id = ?",
        [order.id]
      );

      // Map database fields to what the frontend expects
      const formattedOrder = {
        ...order,
        total: order.totalPrice,
        shipping_address: order.shippingAddress,
        payment_method: order.paymentMethod,
        items: items,
      };

      res.json(formattedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    if (result.affectedRows > 0) {
      // If status is Delivered, update deliveredAt
      if (status === "Delivered") {
        await pool.query(
          "UPDATE orders SET isDelivered = true, deliveredAt = CURRENT_TIMESTAMP WHERE id = ?",
          [req.params.id]
        );
      }
      // If status is Paid, update paidAt
      if (status === "Paid") {
        await pool.query(
          "UPDATE orders SET isPaid = true, paidAt = CURRENT_TIMESTAMP WHERE id = ?",
          [req.params.id]
        );
      }

      res.json({ message: "Order status updated successfully" });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add endpoint to get order analytics for admin dashboard
export const getOrderAnalytics = async (req, res) => {
  try {
    // Get total sales amount
    const [totalSalesResult] = await pool.query(`
      SELECT SUM(totalPrice) as totalSales 
      FROM orders 
      WHERE status IN ('Paid', 'Processing', 'Shipped', 'Delivered')
    `);

    // Get total number of orders
    const [totalOrdersResult] = await pool.query(`
      SELECT COUNT(*) as totalOrders 
      FROM orders
    `);

    // Get number of pending orders
    const [pendingOrdersResult] = await pool.query(`
      SELECT COUNT(*) as pendingOrders 
      FROM orders 
      WHERE status = 'Pending'
    `);

    // Get number of delivered orders
    const [deliveredOrdersResult] = await pool.query(`
      SELECT COUNT(*) as deliveredOrders 
      FROM orders 
      WHERE status = 'Delivered'
    `);

    // Get top selling products
    const [topSellingResult] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.image,
        SUM(oi.qty) as totalSold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.id, p.name, p.image
      ORDER BY totalSold DESC
      LIMIT 10
    `);

    // Get inventory levels
    const [inventoryResult] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.stock,
        p.image
      FROM products p
      WHERE p.stock <= 10
      ORDER BY p.stock ASC
    `);

    res.json({
      totalSales: totalSalesResult[0]?.totalSales || 0,
      totalOrders: totalOrdersResult[0]?.totalOrders || 0,
      pendingOrders: pendingOrdersResult[0]?.pendingOrders || 0,
      deliveredOrders: deliveredOrdersResult[0]?.deliveredOrders || 0,
      topSellingProducts: topSellingResult,
      lowInventoryProducts: inventoryResult,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
