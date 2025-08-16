-- Rollback database constraints and validation functions
-- This migration removes data integrity constraints and validation functions

-- Drop triggers first
DROP TRIGGER IF EXISTS trg_validate_user_data ON users;
DROP TRIGGER IF EXISTS trg_validate_school_data ON schools;
DROP TRIGGER IF EXISTS trg_validate_ai_usage_data ON ai_usage;
DROP TRIGGER IF EXISTS trg_audit_users ON users;
DROP TRIGGER IF EXISTS trg_audit_schools ON schools;
DROP TRIGGER IF EXISTS trg_audit_contacts ON contacts;
DROP TRIGGER IF EXISTS trg_update_users_updated_at ON users;
DROP TRIGGER IF EXISTS trg_update_schools_updated_at ON schools;
DROP TRIGGER IF EXISTS trg_update_contacts_updated_at ON contacts;

-- Drop trigger functions
DROP FUNCTION IF EXISTS validate_user_data();
DROP FUNCTION IF EXISTS validate_school_data();
DROP FUNCTION IF EXISTS validate_ai_usage_data();
DROP FUNCTION IF EXISTS audit_table_changes();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Remove table and column comments
COMMENT ON TABLE users IS NULL;
COMMENT ON TABLE schools IS NULL;
COMMENT ON TABLE contacts IS NULL;
COMMENT ON TABLE ai_usage IS NULL;
COMMENT ON TABLE audit_logs IS NULL;
COMMENT ON COLUMN users.password_hash IS NULL;
COMMENT ON COLUMN users.failed_login_attempts IS NULL;
COMMENT ON COLUMN users.locked_until IS NULL;
COMMENT ON COLUMN users.mfa_enabled IS NULL;
COMMENT ON COLUMN ai_usage.cost IS NULL;
COMMENT ON COLUMN ai_usage.tokens_used IS NULL;

-- Drop validation indexes
DROP INDEX IF EXISTS idx_users_email_validation;
DROP INDEX IF EXISTS idx_schools_email_validation;
DROP INDEX IF EXISTS idx_contacts_email_validation;

-- Remove constraints from users table
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_email_format;
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_phone_format;
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_password_strength;
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_postal_code_format;
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_failed_login_attempts;
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_date_of_birth;
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_created_updated;

-- Remove constraints from schools table
ALTER TABLE schools DROP CONSTRAINT IF EXISTS chk_schools_email_format;
ALTER TABLE schools DROP CONSTRAINT IF EXISTS chk_schools_phone_format;
ALTER TABLE schools DROP CONSTRAINT IF EXISTS chk_schools_website_format;
ALTER TABLE schools DROP CONSTRAINT IF EXISTS chk_schools_postal_code_format;
ALTER TABLE schools DROP CONSTRAINT IF EXISTS chk_schools_created_updated;

-- Remove constraints from contacts table
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS chk_contacts_email_format;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS chk_contacts_phone_format;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS chk_contacts_name_not_empty;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS chk_contacts_created_updated;

-- Remove constraints from ai_usage table
ALTER TABLE ai_usage DROP CONSTRAINT IF EXISTS chk_ai_usage_tokens_positive;
ALTER TABLE ai_usage DROP CONSTRAINT IF EXISTS chk_ai_usage_cost_non_negative;
ALTER TABLE ai_usage DROP CONSTRAINT IF EXISTS chk_ai_usage_model_not_empty;

-- Remove constraints from courses table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
    ALTER TABLE courses DROP CONSTRAINT IF EXISTS chk_courses_name_not_empty;
    ALTER TABLE courses DROP CONSTRAINT IF EXISTS chk_courses_created_updated;
  END IF;
END $$;

-- Remove constraints from assignments table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments') THEN
    ALTER TABLE assignments DROP CONSTRAINT IF EXISTS chk_assignments_title_not_empty;
    ALTER TABLE assignments DROP CONSTRAINT IF EXISTS chk_assignments_due_date_future;
    ALTER TABLE assignments DROP CONSTRAINT IF EXISTS chk_assignments_created_updated;
  END IF;
END $$;

-- Remove constraints from deals table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') THEN
    ALTER TABLE deals DROP CONSTRAINT IF EXISTS chk_deals_value_positive;
    ALTER TABLE deals DROP CONSTRAINT IF EXISTS chk_deals_probability_range;
    ALTER TABLE deals DROP CONSTRAINT IF EXISTS chk_deals_created_updated;
  END IF;
END $$;

-- Remove constraints from campaigns table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaigns') THEN
    ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS chk_campaigns_name_not_empty;
    ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS chk_campaigns_budget_positive;
    ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS chk_campaigns_date_range;
    ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS chk_campaigns_created_updated;
  END IF;
END $$;

-- Remove constraints from audit_logs table
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS chk_audit_logs_action_not_empty;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS chk_audit_logs_resource_type_not_empty;

-- Drop validation functions
DROP FUNCTION IF EXISTS validate_email(TEXT);
DROP FUNCTION IF EXISTS validate_phone(TEXT);
DROP FUNCTION IF EXISTS validate_url(TEXT);
DROP FUNCTION IF EXISTS validate_postal_code(TEXT, TEXT);
DROP FUNCTION IF EXISTS validate_password_strength(TEXT);
DROP FUNCTION IF EXISTS validate_json_schema(JSONB, TEXT[]);