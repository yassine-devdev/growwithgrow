-- Database constraints and validation functions
-- This migration adds data integrity constraints and validation functions

-- Create validation functions

-- Email validation function
CREATE OR REPLACE FUNCTION validate_email(email TEXT) RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Phone validation function
CREATE OR REPLACE FUNCTION validate_phone(phone TEXT) RETURNS BOOLEAN AS $$
BEGIN
  -- Allow various phone formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
  RETURN phone ~* '^\+?[\d\s\-\(\)\.]{10,20}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- URL validation function
CREATE OR REPLACE FUNCTION validate_url(url TEXT) RETURNS BOOLEAN AS $$
BEGIN
  RETURN url ~* '^https?://[^\s/$.?#].[^\s]*$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Postal code validation function
CREATE OR REPLACE FUNCTION validate_postal_code(postal_code TEXT, country TEXT DEFAULT 'US') RETURNS BOOLEAN AS $$
BEGIN
  CASE country
    WHEN 'US' THEN
      RETURN postal_code ~* '^\d{5}(-\d{4})?$';
    WHEN 'CA' THEN
      RETURN postal_code ~* '^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$';
    WHEN 'UK', 'GB' THEN
      RETURN postal_code ~* '^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$';
    ELSE
      RETURN LENGTH(postal_code) BETWEEN 3 AND 10;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Password strength validation function
CREATE OR REPLACE FUNCTION validate_password_strength(password_hash TEXT) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if password hash exists and has minimum length (bcrypt hashes are 60 chars)
  RETURN password_hash IS NOT NULL AND LENGTH(password_hash) >= 60;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- JSON schema validation function
CREATE OR REPLACE FUNCTION validate_json_schema(data JSONB, required_keys TEXT[]) RETURNS BOOLEAN AS $$
DECLARE
  key TEXT;
BEGIN
  -- Check if all required keys exist
  FOREACH key IN ARRAY required_keys
  LOOP
    IF NOT (data ? key) THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add check constraints to existing tables

-- Users table constraints
ALTER TABLE users ADD CONSTRAINT chk_users_email_format 
  CHECK (email IS NULL OR validate_email(email));

ALTER TABLE users ADD CONSTRAINT chk_users_phone_format 
  CHECK (phone IS NULL OR validate_phone(phone));

ALTER TABLE users ADD CONSTRAINT chk_users_password_strength 
  CHECK (password_hash IS NULL OR validate_password_strength(password_hash));

ALTER TABLE users ADD CONSTRAINT chk_users_postal_code_format 
  CHECK (postal_code IS NULL OR validate_postal_code(postal_code, country));

ALTER TABLE users ADD CONSTRAINT chk_users_failed_login_attempts 
  CHECK (failed_login_attempts >= 0 AND failed_login_attempts <= 10);

ALTER TABLE users ADD CONSTRAINT chk_users_date_of_birth 
  CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE);

ALTER TABLE users ADD CONSTRAINT chk_users_created_updated 
  CHECK (created_at <= updated_at);

-- Schools table constraints
ALTER TABLE schools ADD CONSTRAINT chk_schools_email_format 
  CHECK (email IS NULL OR validate_email(email));

ALTER TABLE schools ADD CONSTRAINT chk_schools_phone_format 
  CHECK (phone IS NULL OR validate_phone(phone));

ALTER TABLE schools ADD CONSTRAINT chk_schools_website_format 
  CHECK (website IS NULL OR validate_url(website));

ALTER TABLE schools ADD CONSTRAINT chk_schools_postal_code_format 
  CHECK (postal_code IS NULL OR validate_postal_code(postal_code, country));

ALTER TABLE schools ADD CONSTRAINT chk_schools_created_updated 
  CHECK (created_at <= updated_at);

-- Contacts table constraints
ALTER TABLE contacts ADD CONSTRAINT chk_contacts_email_format 
  CHECK (validate_email(email));

ALTER TABLE contacts ADD CONSTRAINT chk_contacts_phone_format 
  CHECK (phone IS NULL OR validate_phone(phone));

ALTER TABLE contacts ADD CONSTRAINT chk_contacts_name_not_empty 
  CHECK (LENGTH(TRIM(first_name)) > 0 AND LENGTH(TRIM(last_name)) > 0);

ALTER TABLE contacts ADD CONSTRAINT chk_contacts_created_updated 
  CHECK (created_at <= updated_at);

-- AI usage table constraints
ALTER TABLE ai_usage ADD CONSTRAINT chk_ai_usage_tokens_positive 
  CHECK (tokens_used > 0);

ALTER TABLE ai_usage ADD CONSTRAINT chk_ai_usage_cost_non_negative 
  CHECK (cost >= 0);

ALTER TABLE ai_usage ADD CONSTRAINT chk_ai_usage_model_not_empty 
  CHECK (LENGTH(TRIM(model_name)) > 0);

-- Courses table constraints (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
    ALTER TABLE courses ADD CONSTRAINT chk_courses_name_not_empty 
      CHECK (LENGTH(TRIM(name)) > 0);
    
    ALTER TABLE courses ADD CONSTRAINT chk_courses_created_updated 
      CHECK (created_at <= updated_at);
  END IF;
END $$;

-- Assignments table constraints (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments') THEN
    ALTER TABLE assignments ADD CONSTRAINT chk_assignments_title_not_empty 
      CHECK (LENGTH(TRIM(title)) > 0);
    
    ALTER TABLE assignments ADD CONSTRAINT chk_assignments_due_date_future 
      CHECK (due_date IS NULL OR due_date >= created_at);
    
    ALTER TABLE assignments ADD CONSTRAINT chk_assignments_created_updated 
      CHECK (created_at <= updated_at);
  END IF;
END $$;

-- Deals table constraints (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') THEN
    ALTER TABLE deals ADD CONSTRAINT chk_deals_value_positive 
      CHECK (value IS NULL OR value > 0);
    
    ALTER TABLE deals ADD CONSTRAINT chk_deals_probability_range 
      CHECK (probability IS NULL OR (probability >= 0 AND probability <= 100));
    
    ALTER TABLE deals ADD CONSTRAINT chk_deals_created_updated 
      CHECK (created_at <= updated_at);
  END IF;
END $$;

-- Campaigns table constraints (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaigns') THEN
    ALTER TABLE campaigns ADD CONSTRAINT chk_campaigns_name_not_empty 
      CHECK (LENGTH(TRIM(name)) > 0);
    
    ALTER TABLE campaigns ADD CONSTRAINT chk_campaigns_budget_positive 
      CHECK (budget IS NULL OR budget > 0);
    
    ALTER TABLE campaigns ADD CONSTRAINT chk_campaigns_date_range 
      CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date);
    
    ALTER TABLE campaigns ADD CONSTRAINT chk_campaigns_created_updated 
      CHECK (created_at <= updated_at);
  END IF;
END $$;

-- Audit logs table constraints
ALTER TABLE audit_logs ADD CONSTRAINT chk_audit_logs_action_not_empty 
  CHECK (LENGTH(TRIM(action)) > 0);

ALTER TABLE audit_logs ADD CONSTRAINT chk_audit_logs_resource_type_not_empty 
  CHECK (LENGTH(TRIM(resource_type)) > 0);

-- Create indexes for constraint validation performance
CREATE INDEX IF NOT EXISTS idx_users_email_validation ON users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_schools_email_validation ON schools(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_email_validation ON contacts(email);

-- Create trigger functions for automatic validation

-- Function to validate user data on insert/update
CREATE OR REPLACE FUNCTION validate_user_data() RETURNS TRIGGER AS $
BEGIN
  -- Additional business logic validation
  IF NEW.role = 'admin' AND NEW.mfa_enabled = FALSE THEN
    RAISE EXCEPTION 'Admin users must have MFA enabled';
  END IF;
  
  IF NEW.locked_until IS NOT NULL AND NEW.locked_until <= NOW() THEN
    NEW.locked_until := NULL;
    NEW.failed_login_attempts := 0;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Function to validate school data on insert/update
CREATE OR REPLACE FUNCTION validate_school_data() RETURNS TRIGGER AS $
BEGIN
  -- Ensure principal exists and is active
  IF NEW.principal_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.principal_id AND is_active = TRUE) THEN
      RAISE EXCEPTION 'Principal must be an active user';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Function to validate AI usage data
CREATE OR REPLACE FUNCTION validate_ai_usage_data() RETURNS TRIGGER AS $
BEGIN
  -- Ensure user exists and is active
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.user_id AND is_active = TRUE) THEN
    RAISE EXCEPTION 'AI usage must be associated with an active user';
  END IF;
  
  -- Validate cost calculation based on provider
  IF NEW.provider = 'ollama' AND NEW.cost > 0 THEN
    RAISE EXCEPTION 'Ollama provider should have zero cost';
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trg_validate_user_data ON users;
CREATE TRIGGER trg_validate_user_data
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION validate_user_data();

DROP TRIGGER IF EXISTS trg_validate_school_data ON schools;
CREATE TRIGGER trg_validate_school_data
  BEFORE INSERT OR UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION validate_school_data();

DROP TRIGGER IF EXISTS trg_validate_ai_usage_data ON ai_usage;
CREATE TRIGGER trg_validate_ai_usage_data
  BEFORE INSERT OR UPDATE ON ai_usage
  FOR EACH ROW EXECUTE FUNCTION validate_ai_usage_data();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_table_changes() RETURNS TRIGGER AS $
DECLARE
  old_values JSONB := '{}';
  new_values JSONB := '{}';
  user_id_val INTEGER := NULL;
BEGIN
  -- Extract user_id from the record if it exists
  IF TG_OP != 'DELETE' THEN
    IF NEW ? 'user_id' THEN
      user_id_val := (NEW->>'user_id')::INTEGER;
    ELSIF NEW ? 'id' AND TG_TABLE_NAME = 'users' THEN
      user_id_val := (NEW->>'id')::INTEGER;
    END IF;
  ELSE
    IF OLD ? 'user_id' THEN
      user_id_val := (OLD->>'user_id')::INTEGER;
    ELSIF OLD ? 'id' AND TG_TABLE_NAME = 'users' THEN
      user_id_val := (OLD->>'id')::INTEGER;
    END IF;
  END IF;

  -- Build old and new values
  IF TG_OP = 'DELETE' THEN
    old_values := to_jsonb(OLD);
  ELSIF TG_OP = 'UPDATE' THEN
    old_values := to_jsonb(OLD);
    new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    new_values := to_jsonb(NEW);
  END IF;

  -- Insert audit record
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    created_at
  ) VALUES (
    user_id_val,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE((new_values->>'id')::INTEGER, (old_values->>'id')::INTEGER),
    CASE WHEN old_values = '{}' THEN NULL ELSE old_values END,
    CASE WHEN new_values = '{}' THEN NULL ELSE new_values END,
    NOW()
  );

  RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
DROP TRIGGER IF EXISTS trg_audit_users ON users;
CREATE TRIGGER trg_audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

DROP TRIGGER IF EXISTS trg_audit_schools ON schools;
CREATE TRIGGER trg_audit_schools
  AFTER INSERT OR UPDATE OR DELETE ON schools
  FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

DROP TRIGGER IF EXISTS trg_audit_contacts ON contacts;
CREATE TRIGGER trg_audit_contacts
  AFTER INSERT OR UPDATE OR DELETE ON contacts
  FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables with updated_at column
DROP TRIGGER IF EXISTS trg_update_users_updated_at ON users;
CREATE TRIGGER trg_update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_schools_updated_at ON schools;
CREATE TRIGGER trg_update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_contacts_updated_at ON contacts;
CREATE TRIGGER trg_update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add table comments for documentation
COMMENT ON TABLE users IS 'Core user accounts with authentication and profile information';
COMMENT ON TABLE schools IS 'Educational institutions and organizations';
COMMENT ON TABLE contacts IS 'CRM contacts and leads';
COMMENT ON TABLE ai_usage IS 'Tracking of AI service usage and costs';
COMMENT ON TABLE audit_logs IS 'Audit trail for all data changes';

-- Add column comments for key fields
COMMENT ON COLUMN users.password_hash IS 'bcrypt hashed password, minimum 60 characters';
COMMENT ON COLUMN users.failed_login_attempts IS 'Number of consecutive failed login attempts, max 10';
COMMENT ON COLUMN users.locked_until IS 'Account lockout expiration timestamp';
COMMENT ON COLUMN users.mfa_enabled IS 'Multi-factor authentication enabled flag';
COMMENT ON COLUMN ai_usage.cost IS 'Cost in USD for this AI request';
COMMENT ON COLUMN ai_usage.tokens_used IS 'Number of tokens consumed by this request';

