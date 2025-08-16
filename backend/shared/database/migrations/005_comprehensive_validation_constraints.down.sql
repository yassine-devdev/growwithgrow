-- Rollback Comprehensive Database Constraints Migration

-- Drop constraint violations view
DROP VIEW IF EXISTS constraint_violations;

-- Drop audit triggers
DROP TRIGGER IF EXISTS trigger_audit_users ON users;
DROP TRIGGER IF EXISTS trigger_audit_schools ON schools;
DROP TRIGGER IF EXISTS trigger_audit_deals ON deals;
DROP TRIGGER IF EXISTS trigger_audit_ai_usage ON ai_usage;

-- Drop validation triggers
DROP TRIGGER IF EXISTS trigger_validate_admin_mfa ON users;
DROP TRIGGER IF EXISTS trigger_validate_principal_role ON schools;
DROP TRIGGER IF EXISTS trigger_validate_teacher_role_courses ON courses;
DROP TRIGGER IF EXISTS trigger_validate_teacher_role_classes ON classes;
DROP TRIGGER IF EXISTS trigger_validate_student_enrollment ON enrollments;
DROP TRIGGER IF EXISTS trigger_validate_submission_enrollment ON submissions;
DROP TRIGGER IF EXISTS trigger_validate_deal_close_date ON deals;
DROP TRIGGER IF EXISTS trigger_validate_campaign_dates ON campaigns;
DROP TRIGGER IF EXISTS trigger_validate_ollama_cost ON ai_usage;

-- Drop validation functions
DROP FUNCTION IF EXISTS validate_admin_mfa();
DROP FUNCTION IF EXISTS validate_principal_role();
DROP FUNCTION IF EXISTS validate_teacher_role();
DROP FUNCTION IF EXISTS validate_student_enrollment();
DROP FUNCTION IF EXISTS validate_submission_enrollment();
DROP FUNCTION IF EXISTS validate_deal_close_date();
DROP FUNCTION IF EXISTS validate_campaign_dates();
DROP FUNCTION IF EXISTS validate_ollama_cost();
DROP FUNCTION IF EXISTS log_data_changes();

-- Drop audit logs table
DROP TABLE IF EXISTS audit_logs;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_school_id;
DROP INDEX IF EXISTS idx_users_created_at;
DROP INDEX IF EXISTS idx_schools_principal_id;
DROP INDEX IF EXISTS idx_schools_school_type;
DROP INDEX IF EXISTS idx_schools_is_active;
DROP INDEX IF EXISTS idx_courses_school_id;
DROP INDEX IF EXISTS idx_courses_teacher_id;
DROP INDEX IF EXISTS idx_courses_academic_year;
DROP INDEX IF EXISTS idx_classes_course_id;
DROP INDEX IF EXISTS idx_classes_teacher_id;
DROP INDEX IF EXISTS idx_assignments_class_id;
DROP INDEX IF EXISTS idx_assignments_due_date;
DROP INDEX IF EXISTS idx_assignments_status;
DROP INDEX IF EXISTS idx_enrollments_student_id;
DROP INDEX IF EXISTS idx_enrollments_class_id;
DROP INDEX IF EXISTS idx_enrollments_status;
DROP INDEX IF EXISTS idx_submissions_assignment_id;
DROP INDEX IF EXISTS idx_submissions_student_id;
DROP INDEX IF EXISTS idx_submissions_submitted_at;
DROP INDEX IF EXISTS idx_ai_usage_user_id;
DROP INDEX IF EXISTS idx_ai_usage_school_id;
DROP INDEX IF EXISTS idx_ai_usage_provider;
DROP INDEX IF EXISTS idx_ai_usage_created_at;
DROP INDEX IF EXISTS idx_ai_usage_user_date;
DROP INDEX IF EXISTS idx_contacts_email;
DROP INDEX IF EXISTS idx_contacts_type;
DROP INDEX IF EXISTS idx_contacts_company;
DROP INDEX IF EXISTS idx_contacts_source;
DROP INDEX IF EXISTS idx_contacts_is_active;
DROP INDEX IF EXISTS idx_deals_contact_id;
DROP INDEX IF EXISTS idx_deals_owner_id;
DROP INDEX IF EXISTS idx_deals_stage;
DROP INDEX IF EXISTS idx_deals_expected_close_date;
DROP INDEX IF EXISTS idx_deals_is_active;
DROP INDEX IF EXISTS idx_campaigns_owner_id;
DROP INDEX IF EXISTS idx_campaigns_status;
DROP INDEX IF EXISTS idx_campaigns_start_date;
DROP INDEX IF EXISTS idx_campaigns_end_date;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_school_id;
DROP INDEX IF EXISTS idx_notifications_type;
DROP INDEX IF EXISTS idx_notifications_priority;
DROP INDEX IF EXISTS idx_notifications_read_at;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_analytics_user_id;
DROP INDEX IF EXISTS idx_analytics_school_id;
DROP INDEX IF EXISTS idx_analytics_event_name;
DROP INDEX IF EXISTS idx_analytics_event_category;
DROP INDEX IF EXISTS idx_analytics_created_at;
DROP INDEX IF EXISTS idx_analytics_session_id;
DROP INDEX IF EXISTS idx_marketplace_created_by;
DROP INDEX IF EXISTS idx_marketplace_school_id;
DROP INDEX IF EXISTS idx_marketplace_status;
DROP INDEX IF EXISTS idx_marketplace_featured;
DROP INDEX IF EXISTS idx_marketplace_price;
DROP INDEX IF EXISTS idx_support_user_id;
DROP INDEX IF EXISTS idx_support_assigned_to;
DROP INDEX IF EXISTS idx_support_school_id;
DROP INDEX IF EXISTS idx_support_status;
DROP INDEX IF EXISTS idx_support_priority;
DROP INDEX IF EXISTS idx_support_created_at;
DROP INDEX IF EXISTS idx_user_settings_user_id;
DROP INDEX IF EXISTS idx_user_settings_key;

-- Drop webhook constraints
ALTER TABLE webhook_endpoints DROP CONSTRAINT IF EXISTS webhook_url_format;
ALTER TABLE webhook_endpoints DROP CONSTRAINT IF EXISTS webhook_secret_length;
ALTER TABLE webhook_endpoints ALTER COLUMN url DROP NOT NULL;
ALTER TABLE webhook_endpoints ALTER COLUMN secret DROP NOT NULL;

-- Drop user settings constraints
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_user_fk;
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_unique;
ALTER TABLE user_settings ALTER COLUMN key DROP NOT NULL;

-- Drop system settings constraints
ALTER TABLE system_settings DROP CONSTRAINT IF EXISTS system_settings_key_unique;
ALTER TABLE system_settings ALTER COLUMN key DROP NOT NULL;

-- Drop support ticket constraints
ALTER TABLE support_tickets DROP CONSTRAINT IF EXISTS support_user_fk;
ALTER TABLE support_tickets DROP CONSTRAINT IF EXISTS support_assigned_fk;
ALTER TABLE support_tickets DROP CONSTRAINT IF EXISTS support_school_fk;
ALTER TABLE support_tickets DROP CONSTRAINT IF EXISTS support_priority_valid;
ALTER TABLE support_tickets DROP CONSTRAINT IF EXISTS support_status_valid;
ALTER TABLE support_tickets ALTER COLUMN subject DROP NOT NULL;
ALTER TABLE support_tickets ALTER COLUMN description DROP NOT NULL;

-- Drop marketplace constraints
ALTER TABLE marketplace_products DROP CONSTRAINT IF EXISTS marketplace_creator_fk;
ALTER TABLE marketplace_products DROP CONSTRAINT IF EXISTS marketplace_school_fk;
ALTER TABLE marketplace_products DROP CONSTRAINT IF EXISTS marketplace_sku_unique;
ALTER TABLE marketplace_products DROP CONSTRAINT IF EXISTS marketplace_price_positive;
ALTER TABLE marketplace_products DROP CONSTRAINT IF EXISTS marketplace_sale_price_positive;
ALTER TABLE marketplace_products DROP CONSTRAINT IF EXISTS marketplace_stock_non_negative;
ALTER TABLE marketplace_products DROP CONSTRAINT IF EXISTS marketplace_status_valid;
ALTER TABLE marketplace_products DROP CONSTRAINT IF EXISTS marketplace_visibility_valid;
ALTER TABLE marketplace_products DROP CONSTRAINT IF EXISTS marketplace_stock_status_valid;
ALTER TABLE marketplace_products ALTER COLUMN name DROP NOT NULL;
ALTER TABLE marketplace_products ALTER COLUMN sku DROP NOT NULL;

-- Drop analytics constraints
ALTER TABLE analytics_events DROP CONSTRAINT IF EXISTS analytics_user_fk;
ALTER TABLE analytics_events DROP CONSTRAINT IF EXISTS analytics_school_fk;
ALTER TABLE analytics_events DROP CONSTRAINT IF EXISTS analytics_event_value_non_negative;
ALTER TABLE analytics_events ALTER COLUMN session_id DROP NOT NULL;
ALTER TABLE analytics_events ALTER COLUMN event_name DROP NOT NULL;
ALTER TABLE analytics_events ALTER COLUMN event_category DROP NOT NULL;
ALTER TABLE analytics_events ALTER COLUMN event_action DROP NOT NULL;

-- Drop notification constraints
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_fk;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_school_fk;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_class_fk;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_valid;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_priority_valid;
ALTER TABLE notifications ALTER COLUMN title DROP NOT NULL;
ALTER TABLE notifications ALTER COLUMN message DROP NOT NULL;

-- Drop campaign constraints
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_owner_fk;
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_valid;
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_budget_non_negative;
ALTER TABLE campaigns ALTER COLUMN name DROP NOT NULL;

-- Drop deal constraints
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_contact_fk;
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_owner_fk;
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_stage_valid;
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_value_non_negative;
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_probability_range;
ALTER TABLE deals ALTER COLUMN title DROP NOT NULL;

-- Drop contact constraints
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_email_unique;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_type_valid;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_email_format;
ALTER TABLE contacts ALTER COLUMN email DROP NOT NULL;
ALTER TABLE contacts ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE contacts ALTER COLUMN last_name DROP NOT NULL;

-- Drop AI usage constraints
ALTER TABLE ai_usage DROP CONSTRAINT IF EXISTS ai_usage_user_fk;
ALTER TABLE ai_usage DROP CONSTRAINT IF EXISTS ai_usage_school_fk;
ALTER TABLE ai_usage DROP CONSTRAINT IF EXISTS ai_usage_provider_valid;
ALTER TABLE ai_usage DROP CONSTRAINT IF EXISTS ai_usage_request_type_valid;
ALTER TABLE ai_usage DROP CONSTRAINT IF EXISTS ai_usage_tokens_positive;
ALTER TABLE ai_usage DROP CONSTRAINT IF EXISTS ai_usage_cost_non_negative;

-- Drop submission constraints
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_assignment_fk;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_student_fk;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_unique;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_points_non_negative;

-- Drop enrollment constraints
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_student_fk;
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_class_fk;
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_unique;
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_status_valid;

-- Drop assignment constraints
ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_class_fk;
ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_points_positive;
ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_status_valid;
ALTER TABLE assignments ALTER COLUMN title DROP NOT NULL;

-- Drop class constraints
ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_course_fk;
ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_teacher_fk;
ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_max_students_positive;
ALTER TABLE classes ALTER COLUMN name DROP NOT NULL;

-- Drop course constraints
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_school_fk;
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_teacher_fk;
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_credits_non_negative;
ALTER TABLE courses ALTER COLUMN name DROP NOT NULL;

-- Drop school constraints
ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_principal_fk;
ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_school_type_valid;
ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_email_format;
ALTER TABLE schools ALTER COLUMN name DROP NOT NULL;

-- Drop user constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_valid;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_failed_attempts_non_negative;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_format;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;