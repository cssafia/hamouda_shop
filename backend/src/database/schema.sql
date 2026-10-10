-- ============================================================
-- Target: MariaDB 10.6+
-- Charset: utf8mb4 / utf8mb4_unicode_ci
-- Engine: InnoDB
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ============================================================
-- ADMINISTRATION
-- ============================================================

CREATE TABLE administrators (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name     VARCHAR(150)    NOT NULL,
  email         VARCHAR(150)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  role          ENUM('superadmin','admin') NOT NULL DEFAULT 'admin',
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_administrators_email (email),
  KEY idx_administrators_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key`       VARCHAR(100)    NOT NULL,
  label       VARCHAR(150)    NOT NULL,
  module      VARCHAR(100)    NOT NULL,
  description VARCHAR(255)    NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_permissions_key (`key`),
  KEY idx_permissions_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE administrator_permissions (
  administrator_id BIGINT UNSIGNED NOT NULL,
  permission_id    BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (administrator_id, permission_id),
  KEY idx_admin_perm_permission (permission_id),
  CONSTRAINT fk_admin_perm_admin FOREIGN KEY (administrator_id) REFERENCES administrators(id) ON DELETE CASCADE,
  CONSTRAINT fk_admin_perm_perm  FOREIGN KEY (permission_id)    REFERENCES permissions(id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- NOTIFICATIONS (admin-only)
-- ============================================================

CREATE TABLE notifications (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  type         ENUM('new_order','new_service_request') NOT NULL,
  title        VARCHAR(200)    NOT NULL,
  message      TEXT            NOT NULL,
  related_type ENUM('order','service_request') NULL,
  related_id   BIGINT UNSIGNED NULL,
  is_read      TINYINT(1)      NOT NULL DEFAULT 0,
  created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_is_read (is_read),
  KEY idx_notifications_created (created_at),
  KEY idx_notifications_related (related_type, related_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CATALOG
-- ============================================================

CREATE TABLE categories (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  parent_id  BIGINT UNSIGNED NULL,
  name       VARCHAR(100)    NOT NULL,
  slug       VARCHAR(120)    NOT NULL,
  is_active  TINYINT(1)      NOT NULL DEFAULT 1,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_parent (parent_id),
  KEY idx_categories_is_active (is_active),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE brands (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100)    NOT NULL,
  is_active  TINYINT(1)      NOT NULL DEFAULT 1,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_brands_name (name),
  KEY idx_brands_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usages (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100)    NOT NULL,
  slug       VARCHAR(120)    NOT NULL,
  is_active  TINYINT(1)      NOT NULL DEFAULT 1,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usages_slug (slug),
  KEY idx_usages_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
  id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id          BIGINT UNSIGNED NOT NULL,
  brand_id             BIGINT UNSIGNED NULL,
  name                 VARCHAR(200)    NOT NULL,
  slug                 VARCHAR(220)    NOT NULL,
  product_type         ENUM('physical','digital') NOT NULL,
  description          TEXT            NULL,
  price                DECIMAL(12,2)   NOT NULL DEFAULT 0,
  promotional_price    DECIMAL(12,2)   NULL,
  profit               DECIMAL(12,2)   NOT NULL DEFAULT 0,
  stock_quantity       INT UNSIGNED    NULL,
  `condition`          VARCHAR(50)     NULL,
  color                VARCHAR(50)     NULL,
  included_accessories TEXT            NULL,
  duration             VARCHAR(50)     NULL,
  version              VARCHAR(100)    NULL,
  is_active            TINYINT(1)      NOT NULL DEFAULT 1,
  created_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_slug (slug),
  KEY idx_products_category (category_id),
  KEY idx_products_brand (brand_id),
  KEY idx_products_type (product_type),
  KEY idx_products_is_active (is_active),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_products_brand    FOREIGN KEY (brand_id)    REFERENCES brands(id)     ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_variants (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id        BIGINT UNSIGNED NOT NULL,
  name              VARCHAR(150)    NOT NULL,
  sku               VARCHAR(100)    NOT NULL,
  price             DECIMAL(12,2)   NOT NULL DEFAULT 0,
  promotional_price DECIMAL(12,2)   NULL,
  profit            DECIMAL(12,2)   NOT NULL DEFAULT 0,
  stock_quantity    INT UNSIGNED    NULL,
  duration          VARCHAR(50)     NULL,
  version           VARCHAR(100)    NULL,
  is_active         TINYINT(1)      NOT NULL DEFAULT 1,
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_variants_sku (sku),
  KEY idx_variants_product (product_id),
  KEY idx_variants_is_active (is_active),
  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_specifications (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id    BIGINT UNSIGNED NOT NULL,
  variant_id    BIGINT UNSIGNED NULL,
  name          VARCHAR(100)    NOT NULL,
  value         TEXT            NOT NULL,
  display_order INT             NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_specs_product (product_id),
  KEY idx_specs_variant (variant_id),
  KEY idx_specs_name (name),
  CONSTRAINT fk_specs_product FOREIGN KEY (product_id) REFERENCES products(id)         ON DELETE CASCADE,
  CONSTRAINT fk_specs_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_usages (
  product_id BIGINT UNSIGNED NOT NULL,
  usage_id   BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, usage_id),
  KEY idx_product_usages_usage (usage_id),
  CONSTRAINT fk_product_usages_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_product_usages_usage   FOREIGN KEY (usage_id)   REFERENCES usages(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_images (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id    BIGINT UNSIGNED NOT NULL,
  url           VARCHAR(500)    NOT NULL,
  is_primary    TINYINT(1)      NOT NULL DEFAULT 0,
  display_order INT             NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_images_product (product_id),
  KEY idx_images_primary (product_id, is_primary),
  CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CART
-- ============================================================

CREATE TABLE carts (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  session_id VARCHAR(100)    NOT NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_carts_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cart_items (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cart_id     BIGINT UNSIGNED NOT NULL,
  product_id  BIGINT UNSIGNED NOT NULL,
  variant_id  BIGINT UNSIGNED NULL,
  quantity    INT UNSIGNED    NOT NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cart_items_cart (cart_id),
  KEY idx_cart_items_product (product_id),
  KEY idx_cart_items_variant (variant_id),
  CONSTRAINT fk_cart_items_cart    FOREIGN KEY (cart_id)    REFERENCES carts(id)            ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id)         ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ============================================================
-- COUPONS
-- ============================================================

CREATE TABLE coupons (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code           VARCHAR(50)     NOT NULL,
  scope          ENUM('all','products','categories') NOT NULL,
  discount_type  ENUM('percentage','fixed')          NOT NULL,
  discount_value DECIMAL(12,2)   NOT NULL,
  minimum_amount DECIMAL(12,2)   NULL,
  usage_limit    INT UNSIGNED    NULL,
  used_count     INT UNSIGNED    NOT NULL DEFAULT 0,
  starts_at      DATETIME        NULL,
  expires_at     DATETIME        NULL,
  is_active      TINYINT(1)      NOT NULL DEFAULT 1,
  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_coupons_code (code),
  KEY idx_coupons_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE coupon_products (
  coupon_id  BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (coupon_id, product_id),
  KEY idx_coupon_products_product (product_id),
  CONSTRAINT fk_coupon_products_coupon  FOREIGN KEY (coupon_id)  REFERENCES coupons(id)  ON DELETE CASCADE,
  CONSTRAINT fk_coupon_products_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE coupon_categories (
  coupon_id   BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (coupon_id, category_id),
  KEY idx_coupon_categories_category (category_id),
  CONSTRAINT fk_coupon_categories_coupon   FOREIGN KEY (coupon_id)   REFERENCES coupons(id)    ON DELETE CASCADE,
  CONSTRAINT fk_coupon_categories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ORDERS (physical + digital)
-- ============================================================

CREATE TABLE orders (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_name    VARCHAR(150)    NOT NULL,
  customer_phone   VARCHAR(30)     NOT NULL,
  order_type       ENUM('physical','digital') NOT NULL,
  status           ENUM('pending','confirmed','shipped','completed','rejected','cancelled','returned')
                     NOT NULL DEFAULT 'pending',
  subtotal         DECIMAL(12,2)   NOT NULL DEFAULT 0,
  discount_amount  DECIMAL(12,2)   NOT NULL DEFAULT 0,
  shipping_cost    DECIMAL(12,2)   NOT NULL DEFAULT 0,
  total_amount     DECIMAL(12,2)   NOT NULL DEFAULT 0,
  profit           DECIMAL(12,2)   NOT NULL DEFAULT 0,
  coupon_id        BIGINT UNSIGNED NULL,
  rejection_reason VARCHAR(255)    NULL,
  rejection_note   TEXT            NULL,
  rejected_by      BIGINT UNSIGNED NULL,
  note             TEXT            NULL,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_status (status),
  KEY idx_orders_type (order_type),
  KEY idx_orders_phone (customer_phone),
  KEY idx_orders_created (created_at),
  KEY idx_orders_coupon (coupon_id),
  CONSTRAINT fk_orders_coupon    FOREIGN KEY (coupon_id)   REFERENCES coupons(id)        ON DELETE SET NULL,
  CONSTRAINT fk_orders_rejected  FOREIGN KEY (rejected_by) REFERENCES administrators(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id     BIGINT UNSIGNED NOT NULL,
  product_id   BIGINT UNSIGNED NULL,
  variant_id   BIGINT UNSIGNED NULL,
  product_name VARCHAR(200)    NOT NULL,
  variant_name VARCHAR(150)    NULL,
  unit_price   DECIMAL(12,2)   NOT NULL,
  quantity     INT UNSIGNED    NOT NULL,
  profit       DECIMAL(12,2)   NOT NULL DEFAULT 0,
  created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_product (product_id),
  KEY idx_order_items_variant (variant_id),
  CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id)            ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)          ON DELETE SET NULL,
  CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SHIPPING (physical orders only)
-- ============================================================

CREATE TABLE shippings (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id        BIGINT UNSIGNED NOT NULL,
  delivery_type   ENUM('home','stop_desk') NOT NULL,
  wilaya          VARCHAR(100)    NOT NULL,
  commune         VARCHAR(100)    NOT NULL,
  address         VARCHAR(255)    NULL,
  stop_desk_name  VARCHAR(150)    NULL,
  courier         VARCHAR(100)    NULL,
  tracking_number VARCHAR(100)    NULL,
  status          VARCHAR(50)     NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_shippings_order (order_id),
  KEY idx_shippings_tracking (tracking_number),
  CONSTRAINT fk_shippings_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CUSTOM SERVICE REQUESTS
-- ============================================================

CREATE TABLE service_requests (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_name  VARCHAR(150)    NOT NULL,
  customer_phone VARCHAR(30)     NOT NULL,
  service_name   VARCHAR(200)    NOT NULL,
  description    TEXT            NOT NULL,
  status         ENUM('pending','accepted','rejected','completed')
                   NOT NULL DEFAULT 'pending',
  amount         DECIMAL(12,2)   NULL,
  profit         DECIMAL(12,2)   NULL,
  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_service_requests_status (status),
  KEY idx_service_requests_phone (customer_phone),
  KEY idx_service_requests_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;