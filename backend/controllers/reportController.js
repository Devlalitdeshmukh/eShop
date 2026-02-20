import pool from "../config/db.js";

export const getProductReports = async (req, res) => {
  try {
    // 1. Inventory Report (Stock Levels)
    const [stockLevels] = await pool.query(
      "SELECT name, stock FROM products ORDER BY stock ASC LIMIT 10"
    );

    // 2. Category Distribution
    const [categoryDist] = await pool.query(`
      SELECT c.name as name, COUNT(*) as value 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      GROUP BY c.id, c.name
    `);

    // 3. Overall Performance Summary (Current Month)
    const [[summary]] = await pool.query(`
      SELECT 
        IFNULL(SUM(totalPrice), 0) as totalRevenue, 
        COUNT(*) as totalOrders,
        IFNULL(AVG(totalPrice), 0) as avgOrderValue
      FROM orders
    `);

    // 3b. Previous Month Summary
    const [[prevMonthSummary]] = await pool.query(`
      SELECT 
        IFNULL(SUM(totalPrice), 0) as totalRevenue, 
        COUNT(*) as totalOrders
      FROM orders
      WHERE created_at < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
      AND created_at >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01')
    `);

    // 4. Customers Info
    const [[customerStats]] = await pool.query(`
      SELECT 
        COUNT(*) as totalCustomers,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as newToday
      FROM users
      WHERE role = 'CUSTOMER'
    `);

    // 5. Total Pending orders
    const [[pendingOrders]] = await pool.query(`
      SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'
    `);

    // 6. Top Selling Products
    const [topSelling] = await pool.query(`
      SELECT 
        p.name, 
        SUM(oi.qty) as sold,
        SUM(oi.qty * oi.price) as revenue
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      GROUP BY p.id, p.name 
      ORDER BY sold DESC 
      LIMIT 5
    `);

    // 7. Monthly Sales Trend (Last 7 months)
    const [salesTrend] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%b') as month,
        IFNULL(SUM(totalPrice), 0) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
      GROUP BY month, MONTH(created_at)
      ORDER BY MONTH(created_at) ASC
    `);

    res.json({
      stockLevels,
      categoryDist,
      topSelling,
      summary: {
        ...summary,
        prevRevenue: prevMonthSummary.totalRevenue,
        prevOrders: prevMonthSummary.totalOrders,
        totalCustomers: customerStats.totalCustomers,
        newCustomersToday: customerStats.newToday,
        pendingOrders: pendingOrders.count,
      },
      salesTrend,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get detailed order analytics for admin dashboard
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
