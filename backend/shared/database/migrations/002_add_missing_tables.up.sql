-- Additional tables to complete the database schema
-- This migration adds tables for notifications, analytics, marketplace, and other missing entities

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('info', 'success', 'warning', 'error', 'assignment', 'grade', 'announcement', 'reminder')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  school_id INTEGER REFERENCES schools(id),
  class_id INTEGER REFERENCES classes(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Notification preferences table
CREATE TABLE notification_preferences (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  notification_type VARCHAR(50) NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  in_app_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

-- Analytics events table
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  session_id VARCHAR(255),
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50) NOT NULL,
  event_action VARCHAR(50) NOT NULL,
  event_label VARCHAR(100),
  event_value INTEGER,
  properties JSONB DEFAULT '{}',
  page_url TEXT,
  page_title VARCHAR(255),
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser VARCHAR(50),
  os VARCHAR(50),
  school_id INTEGER REFERENCES schools(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Page views table
CREATE TABLE page_views (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  session_id VARCHAR(255) NOT NULL,
  page_url TEXT NOT NULL,
  page_title VARCHAR(255),
  referrer TEXT,
  duration_seconds INTEGER,
  bounce BOOLEAN DEFAULT false,
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser VARCHAR(50),
  os VARCHAR(50),
  school_id INTEGER REFERENCES schools(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- User sessions table for analytics
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  events INTEGER DEFAULT 0,
  bounce BOOLEAN DEFAULT false,
  entry_page TEXT,
  exit_page TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser VARCHAR(50),
  os VARCHAR(50),
  school_id INTEGER REFERENCES schools(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Marketplace categories table
CREATE TABLE marketplace_categories (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES marketplace_categories(id),
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Marketplace products table
CREATE TABLE marketplace_products (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  short_description TEXT,
  sku VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  sale_price DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  category_id INTEGER REFERENCES marketplace_categories(id),
  brand VARCHAR(100),
  weight DECIMAL(8,2),
  dimensions JSONB DEFAULT '{}',
  images JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  stock_quantity INTEGER DEFAULT 0,
  stock_status VARCHAR(20) DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'on_backorder')),
  manage_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'private')),
  visibility VARCHAR(20) DEFAULT 'visible' CHECK (visibility IN ('visible', 'catalog', 'search', 'hidden')),
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  created_by INTEGER NOT NULL REFERENCES users(id),
  school_id INTEGER REFERENCES schools(id),
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Marketplace orders table
CREATE TABLE marketplace_orders (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  currency VARCHAR(3) DEFAULT 'USD',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  shipping_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  billing_address JSONB DEFAULT '{}',
  shipping_address JSONB DEFAULT '{}',
  notes TEXT,
  school_id INTEGER REFERENCES schools(id),
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Marketplace order items table
CREATE TABLE marketplace_order_items (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  order_id INTEGER NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES marketplace_products(id),
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Marketplace reviews table
CREATE TABLE marketplace_reviews (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  product_id INTEGER NOT NULL REFERENCES marketplace_products(id),
  customer_id INTEGER NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, customer_id)
);

-- Support tickets table
CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  category VARCHAR(100),
  assigned_to INTEGER REFERENCES users(id),
  school_id INTEGER REFERENCES schools(id),
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Support ticket replies table
CREATE TABLE support_ticket_replies (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Webhooks endpoints table
CREATE TABLE webhook_endpoints (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  url TEXT NOT NULL,
  events JSONB NOT NULL DEFAULT '[]',
  secret VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER NOT NULL REFERENCES users(id),
  school_id INTEGER REFERENCES schools(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Webhook deliveries table
CREATE TABLE webhook_deliveries (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  endpoint_id INTEGER NOT NULL REFERENCES webhook_endpoints(id),
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  response_headers JSONB DEFAULT '{}',
  attempts INTEGER DEFAULT 0,
  delivered_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- System settings table
CREATE TABLE system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  key VARCHAR(255) NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Create indexes for the new tables

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_school ON notifications(school_id);
CREATE INDEX idx_notifications_class ON notifications(class_id);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_expires ON notifications(expires_at);

-- Notification preferences indexes
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_type ON notification_preferences(notification_type);

-- Analytics indexes
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX idx_analytics_events_school ON analytics_events(school_id);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);

CREATE INDEX idx_page_views_user ON page_views(user_id);
CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_url ON page_views(page_url);
CREATE INDEX idx_page_views_school ON page_views(school_id);
CREATE INDEX idx_page_views_created ON page_views(created_at);

CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_school ON user_sessions(school_id);
CREATE INDEX idx_user_sessions_start_time ON user_sessions(start_time);

-- Marketplace indexes
CREATE INDEX idx_marketplace_categories_parent ON marketplace_categories(parent_id);
CREATE INDEX idx_marketplace_categories_slug ON marketplace_categories(slug);
CREATE INDEX idx_marketplace_categories_active ON marketplace_categories(is_active);
CREATE INDEX idx_marketplace_categories_deleted ON marketplace_categories(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_marketplace_products_category ON marketplace_products(category_id);
CREATE INDEX idx_marketplace_products_sku ON marketplace_products(sku);
CREATE INDEX idx_marketplace_products_status ON marketplace_products(status);
CREATE INDEX idx_marketplace_products_featured ON marketplace_products(featured);
CREATE INDEX idx_marketplace_products_school ON marketplace_products(school_id);
CREATE INDEX idx_marketplace_products_created_by ON marketplace_products(created_by);
CREATE INDEX idx_marketplace_products_deleted ON marketplace_products(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_marketplace_orders_customer ON marketplace_orders(customer_id);
CREATE INDEX idx_marketplace_orders_status ON marketplace_orders(status);
CREATE INDEX idx_marketplace_orders_school ON marketplace_orders(school_id);
CREATE INDEX idx_marketplace_orders_created ON marketplace_orders(created_at);
CREATE INDEX idx_marketplace_orders_deleted ON marketplace_orders(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_marketplace_order_items_order ON marketplace_order_items(order_id);
CREATE INDEX idx_marketplace_order_items_product ON marketplace_order_items(product_id);

CREATE INDEX idx_marketplace_reviews_product ON marketplace_reviews(product_id);
CREATE INDEX idx_marketplace_reviews_customer ON marketplace_reviews(customer_id);
CREATE INDEX idx_marketplace_reviews_status ON marketplace_reviews(status);
CREATE INDEX idx_marketplace_reviews_deleted ON marketplace_reviews(deleted_at) WHERE deleted_at IS NULL;

-- Support indexes
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_school ON support_tickets(school_id);
CREATE INDEX idx_support_tickets_created ON support_tickets(created_at);
CREATE INDEX idx_support_tickets_deleted ON support_tickets(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_support_ticket_replies_ticket ON support_ticket_replies(ticket_id);
CREATE INDEX idx_support_ticket_replies_user ON support_ticket_replies(user_id);
CREATE INDEX idx_support_ticket_replies_created ON support_ticket_replies(created_at);

-- Webhooks indexes
CREATE INDEX idx_webhook_endpoints_active ON webhook_endpoints(is_active);
CREATE INDEX idx_webhook_endpoints_school ON webhook_endpoints(school_id);
CREATE INDEX idx_webhook_endpoints_created_by ON webhook_endpoints(created_by);

CREATE INDEX idx_webhook_deliveries_endpoint ON webhook_deliveries(endpoint_id);
CREATE INDEX idx_webhook_deliveries_event_type ON webhook_deliveries(event_type);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(response_status);
CREATE INDEX idx_webhook_deliveries_created ON webhook_deliveries(created_at);
CREATE INDEX idx_webhook_deliveries_retry ON webhook_deliveries(next_retry_at);

-- Settings indexes
CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_public ON system_settings(is_public);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);
CREATE INDEX idx_user_settings_key ON user_settings(key);

-- Add triggers for updated_at timestamps on new tables
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_categories_updated_at BEFORE UPDATE ON marketplace_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_products_updated_at BEFORE UPDATE ON marketplace_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_orders_updated_at BEFORE UPDATE ON marketplace_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_reviews_updated_at BEFORE UPDATE ON marketplace_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_endpoints_updated_at BEFORE UPDATE ON webhook_endpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();