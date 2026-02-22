import pool from "../config/db.js";
import { delCache } from "../utils/cache.js";
import PDFDocument from "pdfkit";
import { buildPaginatedResponse, parsePagination } from "../utils/pagination.js";

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
        "UPDATE products SET stock = stock - ?, total_sales = total_sales + ? WHERE id = ?",
        [item.quantity, item.quantity, item.id]
      );
    }

    await connection.commit();
    await delCache([
      "products:best-selling",
      "products:season:all",
      "products:season:summer",
      "products:season:winter",
      "products:season:festival",
    ]);
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
    const { hasPagination, page, limit, offset } = parsePagination(req.query, {
      page: 1,
      limit: 10,
      maxLimit: 100,
    });

    const [orders] = await pool.query(
      `SELECT * FROM orders ORDER BY created_at DESC${hasPagination ? " LIMIT ? OFFSET ?" : ""}`,
      hasPagination ? [limit, offset] : []
    );

    if (!hasPagination) {
      return res.json(orders);
    }

    const [[countRow]] = await pool.query("SELECT COUNT(*) AS total FROM orders");
    return res.json(
      buildPaginatedResponse({
        rows: orders,
        total: Number(countRow.total || 0),
        page,
        limit,
      })
    );
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

export const getRevenueTracker = async (_req, res) => {
  try {
    const [[overall]] = await pool.query(`
      SELECT
        IFNULL(SUM(totalPrice), 0) AS totalRevenue,
        COUNT(*) AS totalOrders
      FROM orders
      WHERE status IN ('Paid', 'Processing', 'Shipped', 'Delivered')
    `);

    const [[monthly]] = await pool.query(`
      SELECT
        IFNULL(SUM(totalPrice), 0) AS monthlyRevenue,
        COUNT(*) AS monthlyOrders
      FROM orders
      WHERE created_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
      AND status IN ('Paid', 'Processing', 'Shipped', 'Delivered')
    `);

    const [recentOrders] = await pool.query(`
      SELECT id, order_no, totalPrice, status, paymentMethod, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 15
    `);

    res.json({
      totalRevenue: Number(overall.totalRevenue || 0),
      totalOrders: Number(overall.totalOrders || 0),
      monthlyRevenue: Number(monthly.monthlyRevenue || 0),
      monthlyOrders: Number(monthly.monthlyOrders || 0),
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadInvoicePdf = async (req, res) => {
  try {
    const id = req.params.id;
    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE id = ? OR order_no = ?",
      [id, id]
    );

    if (!orders.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orders[0];
    if (
      req.user?.roleCanonical !== "ADMIN" &&
      req.user?.roleCanonical !== "STAFF" &&
      req.user?.id !== order.user_id
    ) {
      return res.status(403).json({ message: "Not authorized to download invoice" });
    }

    const [items] = await pool.query(
      "SELECT name, qty, price FROM order_items WHERE order_id = ?",
      [order.id]
    );

    const filename = `invoice-${order.order_no || order.id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(res);

    doc.fontSize(22).text("Desi Delights - Invoice", { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Invoice No: ${order.order_no || order.id}`);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`);
    doc.text(`Status: ${order.status}`);
    doc.text(`Payment Method: ${order.paymentMethod || "N/A"}`);
    doc.moveDown(1);

    doc.fontSize(12).text("Items", { underline: true });
    doc.moveDown(0.5);

    let y = doc.y;
    items.forEach((item, index) => {
      const lineTotal = Number(item.qty) * Number(item.price);
      doc.fontSize(10).text(`${index + 1}. ${item.name}`, 40, y);
      doc.text(`Qty: ${item.qty}`, 300, y);
      doc.text(`Price: INR ${Number(item.price).toFixed(2)}`, 370, y);
      doc.text(`Total: INR ${lineTotal.toFixed(2)}`, 470, y, { align: "right" });
      y += 20;
      if (y > 730) {
        doc.addPage();
        y = 60;
      }
    });

    doc.moveDown(2);
    doc.fontSize(12).text(`Grand Total: INR ${Number(order.totalPrice).toFixed(2)}`, {
      align: "right",
    });
    doc.moveDown(1);
    doc.fontSize(9).fillColor("gray").text("Thank you for shopping with Desi Delights.", {
      align: "center",
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
