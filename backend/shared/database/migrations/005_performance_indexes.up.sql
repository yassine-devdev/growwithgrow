-- Performance optimization indexes
-- This migration adds strategic indexes to improve query performance

-- Users table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active 
ON users (email) WHERE active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at 
ON users (created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login 
ON users (last_login_at DESC) WHERE last_login_at IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_subscription_status 
ON users (subscription_status, subscription_expires_at) 
WHERE subscription_status IN ('active', 'trial');

-- Sessions table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_id_active 
ON user_sessions (user_id, expires_at) WHERE active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_token_hash 
ON user_sessions USING hash (session_token);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expires_at 
ON user_sessions (expires_at) WHERE active = true;

-- AI usage tracking indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_user_date 
ON ai_usage_logs (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_provider_model 
ON ai_usage_logs (provider, model, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_cost_tracking 
ON ai_usage_logs (user_id, created_at, cost) 
WHERE cost > 0;

-- Dashboard and analytics indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activities_user_date 
ON user_activities (user_id, activity_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activities_type_date 
ON user_activities (activity_type, activity_date DESC);

-- Feature usage indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feature_usage_user_feature 
ON feature_usage (user_id, feature_name, used_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feature_usage_feature_date 
ON feature_usage (feature_name, used_at DESC);

-- Subscription and billing indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_status_expires 
ON subscriptions (status, expires_at) 
WHERE status IN ('active', 'trial', 'past_due');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_events_user_date 
ON billing_events (user_id, event_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_events_type_status 
ON billing_events (event_type, status, event_date DESC);

-- Audit and logging indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_action 
ON audit_logs (user_id, action, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource_action 
ON audit_logs (resource_type, resource_id, action, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_ip_date 
ON audit_logs (ip_address, created_at DESC) 
WHERE ip_address IS NOT NULL;

-- Error and monitoring indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_severity_date 
ON error_logs (severity, created_at DESC) 
WHERE severity IN ('error', 'critical');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_user_date 
ON error_logs (user_id, created_at DESC) 
WHERE user_id IS NOT NULL;

-- Performance monitoring indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_metrics_endpoint_date 
ON performance_metrics (endpoint, recorded_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_metrics_slow_queries 
ON performance_metrics (response_time, recorded_at DESC) 
WHERE response_time > 1000;

-- Search and filtering indexes
-- Full-text search indexes for content
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_search 
ON content USING gin(to_tsvector('english', title || ' ' || description));

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_org_role_active 
ON users (organization_id, role, active) 
WHERE active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_owner_status_date 
ON projects (owner_id, status, created_at DESC) 
WHERE status IN ('active', 'draft');

-- Partial indexes for soft deletes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_not_deleted 
ON users (id, email, created_at) 
WHERE active = true AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_active_not_deleted 
ON projects (id, name, owner_id, created_at) 
WHERE deleted_at IS NULL;

-- Indexes for JSON columns (if using JSONB)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_notifications 
ON user_preferences USING gin((preferences->'notifications'));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_metadata_tags 
ON users USING gin((metadata->'tags'));

-- Time-series data indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_metrics_time_bucket 
ON metrics (date_trunc('hour', recorded_at), metric_name);

-- Foreign key indexes (if not automatically created)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_id 
ON user_sessions (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_user_id 
ON ai_usage_logs (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_id 
ON subscriptions (user_id);

-- Unique indexes for business constraints
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique_active 
ON users (lower(email)) 
WHERE active = true AND deleted_at IS NULL;

-- Covering indexes for read-heavy queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_dashboard_data 
ON users (id, email, name, avatar_url, subscription_status, created_at) 
WHERE active = true;

-- Statistics and aggregation indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_stats_date_type 
ON daily_statistics (stat_date DESC, stat_type);

-- Update table statistics after creating indexes
ANALYZE users;
ANALYZE user_sessions;
ANALYZE ai_usage_logs;
ANALYZE user_activities;
ANALYZE feature_usage;
ANALYZE subscriptions;
ANALYZE billing_events;
ANALYZE audit_logs;
ANALYZE error_logs;
ANALYZE performance_metrics;