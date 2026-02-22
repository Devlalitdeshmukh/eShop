SET NAMES utf8mb4;
SET time_zone = '+00:00';

DROP DATABASE IF EXISTS eShops;
CREATE DATABASE eShops CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eShops;

CREATE TABLE roles (
  id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id TINYINT UNSIGNED NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NULL,
  gender ENUM('Male','Female','Other') NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
  isAdmin TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
  INDEX idx_users_role (role),
  INDEX idx_users_role_id (role_id)
) ENGINE=InnoDB;

CREATE TABLE brands (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_brands_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_categories_name UNIQUE (name),
  CONSTRAINT uq_categories_slug UNIQUE (slug)
) ENGINE=InnoDB;

CREATE TABLE products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  brand_id INT UNSIGNED NULL,
  category_id INT UNSIGNED NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_price DECIMAL(10,2) NULL,
  stock INT NOT NULL DEFAULT 0,
  is_spicy TINYINT(1) NOT NULL DEFAULT 0,
  expiry_date DATE NULL,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  numReviews INT NOT NULL DEFAULT 0,
  is_best_selling TINYINT(1) NOT NULL DEFAULT 0,
  total_sales INT NOT NULL DEFAULT 0,
  season ENUM('Summer','Winter','Festival','All') NOT NULL DEFAULT 'All',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_products_name (name),
  INDEX idx_products_category (category_id),
  INDEX idx_products_stock (stock),
  INDEX idx_products_active (is_active),
  INDEX idx_products_best_selling (is_best_selling),
  INDEX idx_products_total_sales (total_sales),
  INDEX idx_products_season (season)
) ENGINE=InnoDB;

CREATE TABLE product_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(180) NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  is_primary TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_images_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE cart (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  session_token VARCHAR(128) NULL,
  status ENUM('ACTIVE','ORDERED','ABANDONED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_cart_user_status (user_id, status),
  INDEX idx_cart_session (session_token)
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  qty INT UNSIGNED NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT uq_cart_items_cart_product UNIQUE (cart_id, product_id),
  INDEX idx_cart_items_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(50) NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  paymentMethod VARCHAR(255) NOT NULL,
  paymentResult JSON NULL,
  taxPrice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shippingPrice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  totalPrice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  shippingAddress JSON NULL,
  isPaid TINYINT(1) NOT NULL DEFAULT 0,
  paidAt TIMESTAMP NULL,
  isDelivered TINYINT(1) NOT NULL DEFAULT 0,
  deliveredAt TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_orders_order_no UNIQUE (order_no),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL,
  qty INT NOT NULL,
  image VARCHAR(500) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  variant_id VARCHAR(100) NULL,
  variant_name VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_order_items_order (order_id),
  INDEX idx_order_items_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  rating INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_reviews_product_user UNIQUE (product_id, user_id)
) ENGINE=InnoDB;

CREATE TABLE staff_attendance (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  check_in TIME NULL,
  check_out TIME NULL,
  status ENUM('Present','Absent','Half Day','Late') NOT NULL DEFAULT 'Present',
  notes TEXT NULL,
  working_hours VARCHAR(50) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_staff_attendance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_staff_attendance_user_date UNIQUE (user_id, date),
  INDEX idx_staff_attendance_date (date)
) ENGINE=InnoDB;

CREATE TABLE staff_leaves (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  leave_name VARCHAR(255) NOT NULL,
  work_handover_to VARCHAR(255) NULL,
  start_date DATE NOT NULL,
  from_leave_type VARCHAR(50) NOT NULL,
  end_date DATE NOT NULL,
  to_leave_type VARCHAR(50) NOT NULL,
  leave_reason TEXT NOT NULL,
  notes TEXT NULL,
  document_url VARCHAR(255) NULL,
  status ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  approved_by BIGINT UNSIGNED NULL,
  approved_at TIMESTAMP NULL,
  rejection_reason TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_staff_leaves_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_staff_leaves_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_staff_leaves_status (status),
  INDEX idx_staff_leaves_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE holidays (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  description TEXT NULL,
  is_optional TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_holidays_date (date)
) ENGINE=InnoDB;

CREATE TABLE working_hours (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_working_day TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_working_hours_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_working_hours_user_day UNIQUE (user_id, day_of_week)
) ENGINE=InnoDB;

CREATE TABLE leave_balance (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  year INT NOT NULL,
  sick_leave INT NOT NULL DEFAULT 12,
  casual_leave INT NOT NULL DEFAULT 12,
  paid_leave INT NOT NULL DEFAULT 18,
  used_sick_leave INT NOT NULL DEFAULT 0,
  used_casual_leave INT NOT NULL DEFAULT 0,
  used_paid_leave INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_leave_balance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_leave_balance_user_year UNIQUE (user_id, year)
) ENGINE=InnoDB;

CREATE TABLE about (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE contactus (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(255) NULL,
  address TEXT NULL,
  instagram VARCHAR(255) NULL,
  facebook VARCHAR(255) NULL,
  linkedin VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE privacy_policy (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  content LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NULL,
  inquiry_type ENUM('Product','Delivery','Price','Other') NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  message TEXT NOT NULL,
  status ENUM('New','Working','Resolved','Completed') DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_inquiry_status (status),
  INDEX idx_inquiry_type (inquiry_type)
) ENGINE=InnoDB;

CREATE TABLE cms_content (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  content_key VARCHAR(120) NOT NULL,
  content_type ENUM('BANNER','PRODUCT_DESCRIPTION','CATEGORY_CONTENT','STATIC_PAGE') NOT NULL,
  title VARCHAR(255) NULL,
  body LONGTEXT NULL,
  media_url VARCHAR(500) NULL,
  related_category_id INT UNSIGNED NULL,
  related_product_id BIGINT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_cms_content_key UNIQUE (content_key),
  CONSTRAINT fk_cms_category FOREIGN KEY (related_category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_cms_product FOREIGN KEY (related_product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_cms_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_cms_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_cms_type_active (content_type, is_active)
) ENGINE=InnoDB;

INSERT INTO roles (id, name, description) VALUES
(1, 'ADMIN', 'Full platform access'),
(2, 'STAFF', 'Operational access with limited content editing'),
(3, 'CUSTOMER', 'Customer account');

INSERT INTO users (id, role_id, name, email, password, mobile, gender, role, isAdmin, is_active) VALUES
(1, 1, 'Aditi Sharma', 'admin@eshops.local', '$2b$10$yLB6u6L1g1BOvBKzWJyb7.cFk8a/jBI2r4XaIMbBICwIWrNLNP7Ny', '9876543201', 'Female', 'ADMIN', 1, 1),
(2, 2, 'Ravi Verma', 'staff1@eshops.local', '$2b$10$nCBS6gax.xCXwxmd5e/wpOljrALh/ZqI154g7YOGtEECywTqnqu0C', '9876543202', 'Male', 'STAFF', 0, 1),
(3, 2, 'Neha Joshi', 'staff2@eshops.local', '$2b$10$nCBS6gax.xCXwxmd5e/wpOljrALh/ZqI154g7YOGtEECywTqnqu0C', '9876543203', 'Female', 'STAFF', 0, 1),
(4, 3, 'Arjun Mehta', 'customer1@eshops.local', '$2b$10$viUlYaNRFCLxj7rBMmgrzuJTLTmcHz0DHqLHk01f6cJ2MEDxmOq7i', '9876543204', 'Male', 'CUSTOMER', 0, 1),
(5, 3, 'Priya Nair', 'customer2@eshops.local', '$2b$10$viUlYaNRFCLxj7rBMmgrzuJTLTmcHz0DHqLHk01f6cJ2MEDxmOq7i', '9876543205', 'Female', 'CUSTOMER', 0, 1),
(6, 3, 'Karan Singh', 'customer3@eshops.local', '$2b$10$viUlYaNRFCLxj7rBMmgrzuJTLTmcHz0DHqLHk01f6cJ2MEDxmOq7i', '9876543206', 'Male', 'CUSTOMER', 0, 1),
(7, 3, 'Meera Iyer', 'customer4@eshops.local', '$2b$10$viUlYaNRFCLxj7rBMmgrzuJTLTmcHz0DHqLHk01f6cJ2MEDxmOq7i', '9876543207', 'Female', 'CUSTOMER', 0, 1),
(8, 3, 'Sanjay Kulkarni', 'customer5@eshops.local', '$2b$10$viUlYaNRFCLxj7rBMmgrzuJTLTmcHz0DHqLHk01f6cJ2MEDxmOq7i', '9876543208', 'Male', 'CUSTOMER', 0, 1);

INSERT INTO categories (id, name, slug, description, is_active) VALUES
(1, 'Achars', 'achars', 'Traditional Indian pickles packed with spices.', 1),
(2, 'Crispy Papads', 'crispy-papads', 'Crunchy papads to pair with meals and snacks.', 1),
(3, 'Spicy Namkeens', 'spicy-namkeens', 'Savory Indian snack mixes and sev.', 1);

INSERT INTO brands (id, name) VALUES
(1, 'Desi Delights'),
(2, 'Punjab Pantry'),
(3, 'Rajasthani Rasoi'),
(4, 'Gujju Crunch'),
(5, 'South Spice Co.'),
(6, 'Mumbai Munchies');

INSERT INTO products (id, name, image, description, brand_id, category_id, price, discount_price, stock, is_spicy, expiry_date, rating, numReviews, is_active) VALUES
(1, 'Mango Achar', 'https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?auto=format&fit=crop&w=1200&q=80', 'Raw mango pickle cured with mustard oil and red chili masala.', 1, 1, 179.00, 165.00, 120, 1, '2026-12-31', 4.60, 58, 1),
(2, 'Lemon Achar', 'https://images.unsplash.com/photo-1604908176997-4318858f2f69?auto=format&fit=crop&w=1200&q=80', 'Sun-matured lemon pickle with tangy spice blend.', 2, 1, 165.00, NULL, 95, 1, '2026-12-31', 4.40, 43, 1),
(3, 'Mixed Vegetable Achar', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80', 'Cauliflower, carrot, and turnip pickle in Punjabi masala.', 3, 1, 189.00, NULL, 80, 1, '2026-11-30', 4.50, 37, 1),
(4, 'Garlic Achar', 'https://images.unsplash.com/photo-1625943555419-56a2cb596640?auto=format&fit=crop&w=1200&q=80', 'Garlic cloves preserved in chili oil and aromatic spices.', 1, 1, 199.00, 189.00, 75, 1, '2026-10-31', 4.70, 64, 1),
(5, 'Green Chili Achar', 'https://images.unsplash.com/photo-1526312426976-f4d754fa9bd6?auto=format&fit=crop&w=1200&q=80', 'Fiery green chili pickle balanced with mustard and fennel.', 4, 1, 175.00, NULL, 110, 1, '2026-10-31', 4.30, 29, 1),
(6, 'Red Chili Stuffed Achar', 'https://images.unsplash.com/photo-1592415486689-125cbbfcbee2?auto=format&fit=crop&w=1200&q=80', 'Whole red chilies stuffed with traditional spice paste.', 5, 1, 210.00, NULL, 60, 1, '2026-12-31', 4.80, 41, 1),
(7, 'Gongura Pickle', 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=1200&q=80', 'Andhra-style sorrel leaf pickle with deep sour heat.', 2, 1, 225.00, 215.00, 70, 1, '2026-09-30', 4.50, 33, 1),
(8, 'Karonda Achar', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=80', 'Tangy karonda berry pickle with mild jaggery notes.', 6, 1, 185.00, NULL, 68, 1, '2026-09-30', 4.20, 22, 1),
(9, 'Amla Achar', 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=1200&q=80', 'Indian gooseberry pickle rich in taste and nutrition.', 3, 1, 195.00, NULL, 85, 1, '2026-12-31', 4.40, 27, 1),
(10, 'Jackfruit Achar', 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=1200&q=80', 'Tender jackfruit pickle with earthy Indian spices.', 1, 1, 230.00, 220.00, 52, 1, '2026-08-31', 4.60, 19, 1),

(11, 'Garlic Papad', 'https://images.unsplash.com/photo-1619740455993-9e612b1af6a5?auto=format&fit=crop&w=1200&q=80', 'Urad papad infused with roasted garlic and pepper.', 2, 2, 99.00, 89.00, 220, 0, '2026-12-31', 4.50, 71, 1),
(12, 'Masala Papad', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&q=80', 'Classic masala papad with cumin and chili seasoning.', 1, 2, 89.00, NULL, 250, 0, '2026-12-31', 4.40, 65, 1),
(13, 'Jeera Papad', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80', 'Cumin-heavy papad with a clean crunchy texture.', 4, 2, 85.00, NULL, 210, 0, '2026-11-30', 4.30, 48, 1),
(14, 'Black Pepper Papad', 'https://images.unsplash.com/photo-1574653853027-7cf4d3d2e1dd?auto=format&fit=crop&w=1200&q=80', 'Pepper-forward papad with bold bite.', 3, 2, 105.00, 99.00, 160, 1, '2026-11-30', 4.60, 39, 1),
(15, 'Moong Papad', 'https://images.unsplash.com/photo-1601315379734-425a469078de?auto=format&fit=crop&w=1200&q=80', 'Light moong dal papad for everyday meals.', 5, 2, 92.00, NULL, 180, 0, '2026-10-31', 4.20, 31, 1),
(16, 'Rice Papad', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80', 'South-style rice papad, extra crispy when fried.', 6, 2, 95.00, NULL, 170, 0, '2026-10-31', 4.10, 26, 1),
(17, 'Chili Papad', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 'Spicy chili papad for heat lovers.', 2, 2, 102.00, NULL, 140, 1, '2026-09-30', 4.50, 34, 1),
(18, 'Multigrain Papad', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80', 'Papad made from a blend of lentils and grains.', 4, 2, 115.00, 109.00, 130, 0, '2026-09-30', 4.30, 28, 1),
(19, 'Punjabi Papad', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=80', 'Traditional Punjabi papad with rich masala.', 3, 2, 108.00, NULL, 155, 1, '2026-12-31', 4.40, 32, 1),
(20, 'Mini Cocktail Papad', 'https://images.unsplash.com/photo-1625944173183-896ca3bb34f8?auto=format&fit=crop&w=1200&q=80', 'Mini papad rounds ideal for party snacks.', 1, 2, 120.00, NULL, 190, 0, '2026-12-31', 4.20, 24, 1),

(21, 'Aloo Bhujia', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1200&q=80', 'Crispy potato sev with classic Bikaneri masala.', 6, 3, 75.00, 70.00, 300, 1, '2026-12-31', 4.70, 120, 1),
(22, 'Spicy Mixture', 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=1200&q=80', 'Crunchy mix of sev, peanuts, and lentils.', 6, 3, 82.00, NULL, 280, 1, '2026-12-31', 4.60, 99, 1),
(23, 'Khatta Meetha Mix', 'https://images.unsplash.com/photo-1613460004989-cef01064af7e?auto=format&fit=crop&w=1200&q=80', 'Sweet-tangy-spicy snack blend with raisins.', 4, 3, 88.00, NULL, 245, 0, '2026-11-30', 4.40, 81, 1),
(24, 'Bhavnagri Gathiya', 'https://images.unsplash.com/photo-1610621286299-c84b5d5f4f90?auto=format&fit=crop&w=1200&q=80', 'Soft-crunchy gathiya with ajwain notes.', 3, 3, 90.00, NULL, 210, 0, '2026-10-31', 4.30, 67, 1),
(25, 'Nylon Sev', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1200&q=80', 'Fine sev with balanced spice and crunch.', 2, 3, 78.00, NULL, 260, 1, '2026-10-31', 4.50, 73, 1),
(26, 'Murukku Sticks', 'https://images.unsplash.com/photo-1626082895144-0c4d4f1af9da?auto=format&fit=crop&w=1200&q=80', 'Rice-lentil spirals with mild South Indian spices.', 5, 3, 95.00, NULL, 175, 0, '2026-09-30', 4.20, 40, 1),
(27, 'Masala Peanuts', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=1200&q=80', 'Roasted peanuts coated with gram flour masala.', 1, 3, 85.00, 79.00, 230, 1, '2026-09-30', 4.40, 55, 1),
(28, 'Chana Jor Garam', 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=1200&q=80', 'Flattened gram snack with zesty chili seasoning.', 3, 3, 70.00, NULL, 270, 1, '2026-12-31', 4.30, 46, 1),
(29, 'Cornflakes Chivda', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80', 'Light cornflakes mix with peanuts and curry leaves.', 4, 3, 92.00, NULL, 215, 0, '2026-12-31', 4.20, 38, 1),
(30, 'Tikha Poha Mix', 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80', 'Spicy poha namkeen with nuts and lentils.', 2, 3, 80.00, NULL, 240, 1, '2026-11-30', 4.40, 52, 1);

UPDATE products
SET
  total_sales = CASE id
    WHEN 1 THEN 340
    WHEN 2 THEN 220
    WHEN 3 THEN 180
    WHEN 4 THEN 310
    WHEN 5 THEN 205
    WHEN 6 THEN 260
    WHEN 7 THEN 170
    WHEN 8 THEN 140
    WHEN 9 THEN 190
    WHEN 10 THEN 135
    WHEN 11 THEN 420
    WHEN 12 THEN 400
    WHEN 13 THEN 260
    WHEN 14 THEN 280
    WHEN 15 THEN 245
    WHEN 16 THEN 210
    WHEN 17 THEN 255
    WHEN 18 THEN 195
    WHEN 19 THEN 300
    WHEN 20 THEN 175
    WHEN 21 THEN 540
    WHEN 22 THEN 500
    WHEN 23 THEN 360
    WHEN 24 THEN 290
    WHEN 25 THEN 410
    WHEN 26 THEN 230
    WHEN 27 THEN 330
    WHEN 28 THEN 275
    WHEN 29 THEN 215
    WHEN 30 THEN 305
    ELSE 0
  END,
  is_best_selling = CASE WHEN id IN (1,4,6,11,12,19,21,22,25,27,30) THEN 1 ELSE 0 END,
  season = CASE
    WHEN id IN (2,5,8,11,16,21,26,29) THEN 'Summer'
    WHEN id IN (4,7,9,14,15,19,22,25,28) THEN 'Winter'
    WHEN id IN (1,3,6,10,12,17,20,23,24,27,30) THEN 'Festival'
    ELSE 'All'
  END;

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, image, CONCAT(name, ' image'), 1, 1 FROM products;

INSERT INTO about (title, description) VALUES
('Our Story', 'Desi Delights brings authentic Indian pickles, papads, and namkeens crafted using traditional recipes and premium ingredients.');

INSERT INTO contactus (title, description, email, phone, address, instagram, facebook, linkedin) VALUES
('Get in Touch', 'Reach out for support, wholesale inquiries, and partnerships.', 'support@eshops.local', '+91-9876543201', '12 MG Road, Pune, Maharashtra, India', 'https://instagram.com/desidelights', 'https://facebook.com/desidelights', 'https://linkedin.com/company/desidelights');

INSERT INTO privacy_policy (content) VALUES
('We collect only required data for orders and support. Payment details are processed securely by payment providers and are not stored in plain text.');

INSERT INTO inquiries (user_id, name, email, phone, inquiry_type, product_id, message, status) VALUES
(4, 'Arjun Mehta', 'customer1@eshops.local', '9876543204', 'Product', 1, 'Can you confirm shelf life for Mango Achar?', 'New'),
(NULL, 'Guest Buyer', 'guestbuyer@example.com', '9898989898', 'Delivery', NULL, 'Do you deliver to Indore and what is ETA?', 'Working');

INSERT INTO cms_content (content_key, content_type, title, body, media_url, related_category_id, related_product_id, is_active, sort_order, created_by, updated_by) VALUES
('home-banner-1', 'BANNER', 'Authentic Indian Flavors', 'Freshly packed achar, papad, and namkeen delivered to your doorstep.', 'https://images.unsplash.com/photo-1601315576601-8cfb5f39e8fb?auto=format&fit=crop&w=1600&q=80', NULL, NULL, 1, 1, 1, 1),
('category-achars-description', 'CATEGORY_CONTENT', 'Achars Collection', 'Explore our handcrafted range of tangy and spicy pickles.', NULL, 1, NULL, 1, 1, 1, 2),
('product-mango-achar-description', 'PRODUCT_DESCRIPTION', 'Mango Achar Feature', 'Our top-selling mango achar is matured in mustard oil for deep flavor.', NULL, NULL, 1, 1, 1, 2, 2),
('home-best-selling', 'STATIC_PAGE', 'Most & Best Selling Products', NULL, NULL, NULL, NULL, 1, 1, 1, 1),
('home-seasonal', 'STATIC_PAGE', 'Most Popular This Season', NULL, NULL, NULL, NULL, 1, 2, 1, 1),
('home-stats', 'STATIC_PAGE', 'Home Stats', '[{\"label\":\"Happy Customers\",\"value\":15000,\"suffix\":\"+\",\"icon\":\"Smile\"},{\"label\":\"Years of Experience\",\"value\":12,\"suffix\":\"+\",\"icon\":\"TimerReset\"},{\"label\":\"Expert Team Members\",\"value\":25,\"suffix\":\"+\",\"icon\":\"Users\"},{\"label\":\"Products Delivered\",\"value\":50000,\"suffix\":\"+\",\"icon\":\"PackageCheck\"}]', NULL, NULL, NULL, 1, 3, 1, 1),
('home-testimonials', 'STATIC_PAGE', 'What Customers Say', '[{\"name\":\"Riya Patel\",\"text\":\"The mango achar tastes exactly like homemade. Packaging and delivery were excellent.\"},{\"name\":\"Vikram Soni\",\"text\":\"Crispy papads are top quality and the seasonal recommendations are always useful.\"},{\"name\":\"Anita Kulkarni\",\"text\":\"Great flavors, quick support, and very consistent quality across products.\"},{\"name\":\"Rahul Shah\",\"text\":\"Fast delivery and premium quality snacks. I order every month for my family.\"}]', NULL, NULL, NULL, 1, 4, 1, 1);

INSERT INTO holidays (name, date, description, is_optional) VALUES
('Republic Day', '2026-01-26', 'National holiday', 0),
('Holi', '2026-03-14', 'Festival holiday', 1);

INSERT INTO leave_balance (user_id, year) VALUES
(2, 2026),
(3, 2026);

INSERT INTO working_hours (user_id, day_of_week, start_time, end_time, is_working_day) VALUES
(2, 'Monday', '09:00:00', '18:00:00', 1),
(2, 'Tuesday', '09:00:00', '18:00:00', 1),
(2, 'Wednesday', '09:00:00', '18:00:00', 1),
(2, 'Thursday', '09:00:00', '18:00:00', 1),
(2, 'Friday', '09:00:00', '18:00:00', 1),
(3, 'Monday', '10:00:00', '19:00:00', 1),
(3, 'Tuesday', '10:00:00', '19:00:00', 1),
(3, 'Wednesday', '10:00:00', '19:00:00', 1),
(3, 'Thursday', '10:00:00', '19:00:00', 1),
(3, 'Friday', '10:00:00', '19:00:00', 1);

INSERT INTO staff_attendance (user_id, date, check_in, check_out, status, notes, working_hours) VALUES
(2, '2026-02-20', '09:02:00', '18:10:00', 'Present', 'On-time', '9h 8m'),
(3, '2026-02-20', '10:15:00', '19:00:00', 'Late', 'Traffic delay', '8h 45m');

INSERT INTO staff_leaves (user_id, leave_name, work_handover_to, start_date, from_leave_type, end_date, to_leave_type, leave_reason, notes, document_url, status, approved_by, approved_at) VALUES
(2, 'Casual Leave', 'Neha Joshi', '2026-02-25', 'Full Day', '2026-02-25', 'Full Day', 'Family function', 'Requested one day leave', NULL, 'Approved', 1, '2026-02-21 11:00:00'),
(3, 'Sick Leave', 'Ravi Verma', '2026-02-26', 'First Half', '2026-02-26', 'Second Half', 'Fever', 'Medical rest needed', NULL, 'Pending', NULL, NULL);

INSERT INTO orders (id, order_no, user_id, paymentMethod, paymentResult, taxPrice, shippingPrice, totalPrice, status, shippingAddress, isPaid, paidAt, isDelivered, deliveredAt) VALUES
(1, 'ORD-20260222001', 4, 'UPI', NULL, 20.00, 0.00, 438.00, 'Delivered', JSON_OBJECT('name','Arjun Mehta','address','12 MG Road','city','Pune','pincode','411001','phone','9876543204'), 1, '2026-02-20 10:30:00', 1, '2026-02-21 14:10:00'),
(2, 'ORD-20260222002', 5, 'COD', NULL, 12.00, 0.00, 274.00, 'Shipped', JSON_OBJECT('name','Priya Nair','address','44 Marine Drive','city','Mumbai','pincode','400002','phone','9876543205'), 0, NULL, 0, NULL),
(3, 'ORD-20260222003', 6, 'Card', NULL, 9.00, 0.00, 189.00, 'Pending', JSON_OBJECT('name','Karan Singh','address','88 Civil Lines','city','Jaipur','pincode','302006','phone','9876543206'), 0, NULL, 0, NULL),
(4, 'ORD-20260222004', 7, 'NetBanking', NULL, 15.00, 0.00, 355.00, 'Paid', JSON_OBJECT('name','Meera Iyer','address','5 Lake View','city','Bengaluru','pincode','560001','phone','9876543207'), 1, '2026-02-22 09:15:00', 0, NULL);

INSERT INTO order_items (order_id, product_id, name, qty, image, price, variant_id, variant_name) VALUES
(1, 1, 'Mango Achar', 1, 'https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?auto=format&fit=crop&w=1200&q=80', 165.00, NULL, NULL),
(1, 12, 'Masala Papad', 1, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&q=80', 89.00, NULL, NULL),
(1, 22, 'Spicy Mixture', 2, 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=1200&q=80', 82.00, NULL, NULL),
(2, 6, 'Red Chili Stuffed Achar', 1, 'https://images.unsplash.com/photo-1592415486689-125cbbfcbee2?auto=format&fit=crop&w=1200&q=80', 210.00, NULL, NULL),
(2, 21, 'Aloo Bhujia', 1, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1200&q=80', 64.00, NULL, NULL),
(3, 3, 'Mixed Vegetable Achar', 1, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80', 189.00, NULL, NULL),
(4, 14, 'Black Pepper Papad', 1, 'https://images.unsplash.com/photo-1574653853027-7cf4d3d2e1dd?auto=format&fit=crop&w=1200&q=80', 105.00, NULL, NULL),
(4, 27, 'Masala Peanuts', 2, 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=1200&q=80', 79.00, NULL, NULL),
(4, 30, 'Tikha Poha Mix', 1, 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80', 80.00, NULL, NULL);

INSERT INTO cart (id, user_id, session_token, status) VALUES
(1, 4, NULL, 'ACTIVE'),
(2, NULL, 'guest-session-demo-1', 'ACTIVE');

INSERT INTO cart_items (cart_id, product_id, qty, price) VALUES
(1, 11, 2, 89.00),
(1, 21, 1, 70.00),
(2, 2, 1, 165.00);

ALTER TABLE users AUTO_INCREMENT = 100;
ALTER TABLE products AUTO_INCREMENT = 1000;
ALTER TABLE orders AUTO_INCREMENT = 5000;
