-- Performance optimization indexes
-- This migration adds strategic indexes for better query performance

-- Composite indexes for common query patterns

-- Users - frequently queried combinations
CREATE INDEX idx_users_role_active ON users(role, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email_verified ON users(email_verified, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_last_login ON users(last_login_at DESC) WHERE is_active = true;

-- Schools - performance indexes
CREATE INDEX idx_schools_type_active ON schools(school_type, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_schools_location ON schools(country, state, city) WHERE is_active = true;

-- AI Usage - cost and usage analysis
CREATE INDEX idx_ai_usage_user_cost ON ai_usage(user_id, cost DESC, created_at DESC);
CREATE INDEX idx_ai_usage_school_cost ON ai_usage(school_id, cost DESC, created_at DESC) WHERE school_id IS NOT NULL;
CREATE INDEX idx_ai_usage_provider_model ON ai_usage(provider, model_name, created_at DESC);
CREATE INDEX idx_ai_usage_monthly ON ai_usage(user_id, date_trunc('month', created_at));

-- Courses and Classes - academic queries
CREATE INDEX idx_courses_school_year ON courses(school_id, academic_year, semester) WHERE is_active = true;
CREATE INDEX idx_classes_teacher_active ON classes(teacher_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_enrollments_student_status ON enrollments(student_id, status) WHERE deleted_at IS NULL;

-- Assignments and Submissions - grading workflows
CREATE INDEX idx_assignments_class_due ON assignments(class_id, due_date) WHERE is_active = true;
CREATE INDEX idx_submissions_assignment_graded ON submissions(assignment_id, graded_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_submissions_student_late ON submissions(student_id, is_late, submitted_at) WHERE deleted_at IS NULL;

-- CRM - sales and marketing queries
CREATE INDEX idx_contacts_type_active_created ON contacts(contact_type, is_active, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_stage_value ON deals(stage, value DESC) WHERE is_active = true;
CREATE INDEX idx_deals_owner_stage ON deals(owner_id, stage, expected_close_date) WHERE is_active = true;
CREATE INDEX idx_campaigns_status_dates ON campaigns(status, start_date, end_date) WHERE is_active = true;

-- Authentication and Security
CREATE INDEX idx_sessions_user_active ON sessions(user_id, is_active, expires_at);
CREATE INDEX idx_audit_logs_resource_date ON audit_logs(resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_action_date ON audit_logs(user_id, action, created_at DESC);

-- Notifications - user experience
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_school_type ON notifications(school_id, notification_type, created_at DESC) WHERE school_id IS NOT NULL;

-- Analytics - reporting and insights
CREATE INDEX idx_analytics_events_user_date ON analytics_events(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_analytics_events_school_category ON analytics_events(school_id, event_category, created_at DESC) WHERE school_id IS NOT NULL;
CREATE INDEX idx_page_views_user_date ON page_views(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_user_sessions_user_date ON user_sessions(user_id, start_time DESC) WHERE user_id IS NOT NULL;

-- Marketplace - e-commerce queries
CREATE INDEX idx_marketplace_products_category_status ON marketplace_products(category_id, status, featured DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_marketplace_products_price_rating ON marketplace_products(price ASC, rating DESC) WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX idx_marketplace_orders_customer_status ON marketplace_orders(customer_id, status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_marketplace_reviews_product_status ON marketplace_reviews(product_id, status, rating DESC) WHERE deleted_at IS NULL;

-- Support - ticket management
CREATE INDEX idx_support_tickets_assigned_status ON support_tickets(assigned_to, status, priority, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_support_tickets_school_status ON support_tickets(school_id, status, created_at DESC) WHERE school_id IS NOT NULL AND deleted_at IS NULL;

-- Webhooks - delivery tracking
CREATE INDEX idx_webhook_deliveries_endpoint_status ON webhook_deliveries(endpoint_id, response_status, created_at DESC);
CREATE INDEX idx_webhook_deliveries_retry ON webhook_deliveries(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Partial indexes for common filtered queries
CREATE INDEX idx_users_active_teachers ON users(id, first_name, last_name) WHERE role = 'teacher' AND is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_users_active_students ON users(id, first_name, last_name) WHERE role = 'student' AND is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_courses_current_semester ON courses(id, name, teacher_id) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_assignments_upcoming ON assignments(id, title, due_date, class_id) WHERE status = 'published' AND due_date > NOW() AND is_active = true;
CREATE INDEX idx_deals_open ON deals(id, title, value, stage, expected_close_date) WHERE stage NOT IN ('closed_won', 'closed_lost') AND is_active = true;

-- Text search indexes (using GIN for JSONB fields)
CREATE INDEX idx_users_metadata_gin ON users USING GIN (metadata) WHERE metadata IS NOT NULL;
CREATE INDEX idx_schools_settings_gin ON schools USING GIN (settings) WHERE settings IS NOT NULL;
CREATE INDEX idx_ai_usage_metadata_gin ON ai_usage USING GIN (metadata) WHERE metadata IS NOT NULL;
CREATE INDEX idx_contacts_tags_gin ON contacts USING GIN (tags) WHERE tags IS NOT NULL;
CREATE INDEX idx_marketplace_products_tags_gin ON marketplace_products USING GIN (tags) WHERE tags IS NOT NULL;

-- Full-text search indexes for text content
CREATE INDEX idx_assignments_title_description ON assignments USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, ''))) WHERE is_active = true;
CREATE INDEX idx_support_tickets_subject_description ON support_tickets USING GIN (to_tsvector('english', subject || ' ' || description)) WHERE deleted_at IS NULL;
CREATE INDEX idx_marketplace_products_search ON marketplace_products USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, ''))) WHERE status = 'published' AND deleted_at IS NULL;