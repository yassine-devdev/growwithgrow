-- Rollback performance optimization indexes
-- This migration removes the performance indexes added in 003_performance_indexes.up.sql

-- Drop full-text search indexes
DROP INDEX IF EXISTS idx_marketplace_products_search;
DROP INDEX IF EXISTS idx_support_tickets_subject_description;
DROP INDEX IF EXISTS idx_assignments_title_description;

-- Drop GIN indexes for JSONB fields
DROP INDEX IF EXISTS idx_marketplace_products_tags_gin;
DROP INDEX IF EXISTS idx_contacts_tags_gin;
DROP INDEX IF EXISTS idx_ai_usage_metadata_gin;
DROP INDEX IF EXISTS idx_schools_settings_gin;
DROP INDEX IF EXISTS idx_users_metadata_gin;

-- Drop partial indexes
DROP INDEX IF EXISTS idx_deals_open;
DROP INDEX IF EXISTS idx_assignments_upcoming;
DROP INDEX IF EXISTS idx_courses_current_semester;
DROP INDEX IF EXISTS idx_users_active_students;
DROP INDEX IF EXISTS idx_users_active_teachers;

-- Drop webhook indexes
DROP INDEX IF EXISTS idx_webhook_deliveries_retry;
DROP INDEX IF EXISTS idx_webhook_deliveries_endpoint_status;

-- Drop support indexes
DROP INDEX IF EXISTS idx_support_tickets_school_status;
DROP INDEX IF EXISTS idx_support_tickets_assigned_status;

-- Drop marketplace indexes
DROP INDEX IF EXISTS idx_marketplace_reviews_product_status;
DROP INDEX IF EXISTS idx_marketplace_orders_customer_status;
DROP INDEX IF EXISTS idx_marketplace_products_price_rating;
DROP INDEX IF EXISTS idx_marketplace_products_category_status;

-- Drop analytics indexes
DROP INDEX IF EXISTS idx_user_sessions_user_date;
DROP INDEX IF EXISTS idx_page_views_user_date;
DROP INDEX IF EXISTS idx_analytics_events_school_category;
DROP INDEX IF EXISTS idx_analytics_events_user_date;

-- Drop notification indexes
DROP INDEX IF EXISTS idx_notifications_school_type;
DROP INDEX IF EXISTS idx_notifications_user_unread;

-- Drop authentication indexes
DROP INDEX IF EXISTS idx_audit_logs_user_action_date;
DROP INDEX IF EXISTS idx_audit_logs_resource_date;
DROP INDEX IF EXISTS idx_sessions_user_active;

-- Drop CRM indexes
DROP INDEX IF EXISTS idx_campaigns_status_dates;
DROP INDEX IF EXISTS idx_deals_owner_stage;
DROP INDEX IF EXISTS idx_deals_stage_value;
DROP INDEX IF EXISTS idx_contacts_type_active_created;

-- Drop assignment and submission indexes
DROP INDEX IF EXISTS idx_submissions_student_late;
DROP INDEX IF EXISTS idx_submissions_assignment_graded;
DROP INDEX IF EXISTS idx_assignments_class_due;

-- Drop course and class indexes
DROP INDEX IF EXISTS idx_enrollments_student_status;
DROP INDEX IF EXISTS idx_classes_teacher_active;
DROP INDEX IF EXISTS idx_courses_school_year;

-- Drop AI usage indexes
DROP INDEX IF EXISTS idx_ai_usage_monthly;
DROP INDEX IF EXISTS idx_ai_usage_provider_model;
DROP INDEX IF EXISTS idx_ai_usage_school_cost;
DROP INDEX IF EXISTS idx_ai_usage_user_cost;

-- Drop school indexes
DROP INDEX IF EXISTS idx_schools_location;
DROP INDEX IF EXISTS idx_schools_type_active;

-- Drop user indexes
DROP INDEX IF EXISTS idx_users_last_login;
DROP INDEX IF EXISTS idx_users_email_verified;
DROP INDEX IF EXISTS idx_users_role_active;