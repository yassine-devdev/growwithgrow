-- Remove performance optimization indexes
-- This migration removes all the performance indexes added in the up migration

-- Users table indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_users_email_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_users_created_at;
DROP INDEX CONCURRENTLY IF EXISTS idx_users_last_login;
DROP INDEX CONCURRENTLY IF EXISTS idx_users_subscription_status;

-- Sessions table indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_sessions_user_id_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_sessions_token_hash;
DROP INDEX CONCURRENTLY IF EXISTS idx_sessions_expires_at;

-- AI usage tracking indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_ai_usage_user_date;
DROP INDEX CONCURRENTLY IF EXISTS idx_ai_usage_provider_model;
DROP INDEX CONCURRENTLY IF EXISTS idx_ai_usage_cost_tracking;

-- Dashboard and analytics indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_user_activities_user_date;
DROP INDEX CONCURRENTLY IF EXISTS idx_user_activities_type_date;

-- Feature usage indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_feature_usage_user_feature;
DROP INDEX CONCURRENTLY IF EXISTS idx_feature_usage_feature_date;

-- Subscription and billing indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_subscriptions_status_expires;
DROP INDEX CONCURRENTLY IF EXISTS idx_billing_events_user_date;
DROP INDEX CONCURRENTLY IF EXISTS idx_billing_events_type_status;

-- Audit and logging indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_audit_logs_user_action;
DROP INDEX CONCURRENTLY IF EXISTS idx_audit_logs_resource_action;
DROP INDEX CONCURRENTLY IF EXISTS idx_audit_logs_ip_date;

-- Error and monitoring indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_error_logs_severity_date;
DROP INDEX CONCURRENTLY IF EXISTS idx_error_logs_user_date;

-- Performance monitoring indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_performance_metrics_endpoint_date;
DROP INDEX CONCURRENTLY IF EXISTS idx_performance_metrics_slow_queries;

-- Search and filtering indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_content_search;

-- Composite indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_users_org_role_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_projects_owner_status_date;

-- Partial indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_users_active_not_deleted;
DROP INDEX CONCURRENTLY IF EXISTS idx_projects_active_not_deleted;

-- JSON indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_user_preferences_notifications;
DROP INDEX CONCURRENTLY IF EXISTS idx_user_metadata_tags;

-- Time-series indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_metrics_time_bucket;

-- Foreign key indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_user_sessions_user_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_ai_usage_user_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_subscriptions_user_id;

-- Unique indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_users_email_unique_active;

-- Covering indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_users_dashboard_data;

-- Statistics indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_daily_stats_date_type;