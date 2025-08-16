-- Rollback migration for additional tables
-- This migration removes the additional tables added in 002_add_missing_tables.up.sql

-- Drop triggers first
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
DROP TRIGGER IF EXISTS update_webhook_endpoints_updated_at ON webhook_endpoints;
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
DROP TRIGGER IF EXISTS update_marketplace_reviews_updated_at ON marketplace_reviews;
DROP TRIGGER IF EXISTS update_marketplace_orders_updated_at ON marketplace_orders;
DROP TRIGGER IF EXISTS update_marketplace_products_updated_at ON marketplace_products;
DROP TRIGGER IF EXISTS update_marketplace_categories_updated_at ON marketplace_categories;
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS webhook_deliveries;
DROP TABLE IF EXISTS webhook_endpoints;
DROP TABLE IF EXISTS support_ticket_replies;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS marketplace_reviews;
DROP TABLE IF EXISTS marketplace_order_items;
DROP TABLE IF EXISTS marketplace_orders;
DROP TABLE IF EXISTS marketplace_products;
DROP TABLE IF EXISTS marketplace_categories;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS page_views;
DROP TABLE IF EXISTS analytics_events;
DROP TABLE IF EXISTS notification_preferences;
DROP TABLE IF EXISTS notifications;