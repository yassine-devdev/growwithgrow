-- Comprehensive Database Constraints Migration
-- Implements data validation and integrity constraints

-- User table constraints
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_role_valid CHECK (role IN ('student', 'teacher', 'admin', 'parent', 'principal', 'super_admin'));
ALTER TABLE users ADD CONSTRAINT users_failed_attempts_non_negative CHECK (failed_login_attempts >= 0);
ALTER TABLE users ADD CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- School table constraints
ALTER TABLE schools ALTER COLUMN name SET NOT NULL;
ALTER TABLE schools ADD CONSTRAINT schools_principal_fk FOREIGN KEY (principal_id) REFERENCES users(id);
ALTER TABLE schools ADD CONSTRAINT schools_school_type_valid CHECK (school_type IN ('elementary', 'middle', 'high', 'university', 'vocational', 'other'));
ALTER TABLE schools ADD CONSTRAINT schools_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Course table constraints
ALTER TABLE courses ADD CONSTRAINT courses_school_fk FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE courses ADD CONSTRAINT courses_teacher_fk FOREIGN KEY (teacher_id) REFERENCES users(id);
ALTER TABLE courses ALTER COLUMN name SET NOT NULL;
ALTER TABLE courses ADD CONSTRAINT courses_credits_non_negative CHECK (credits >= 0);

-- Class table constraints
ALTER TABLE classes ADD CONSTRAINT classes_course_fk FOREIGN KEY (course_id) REFERENCES courses(id);
ALTER TABLE classes ADD CONSTRAINT classes_teacher_fk FOREIGN KEY (teacher_id) REFERENCES users(id);
ALTER TABLE classes ALTER COLUMN name SET NOT NULL;
ALTER TABLE classes ADD CONSTRAINT classes_max_students_positive CHECK (max_students > 0);

-- Assignment table constraints
ALTER TABLE assignments ADD CONSTRAINT assignments_class_fk FOREIGN KEY (class_id) REFERENCES classes(id);
ALTER TABLE assignments ALTER COLUMN title SET NOT NULL;
ALTER TABLE assignments ADD CONSTRAINT assignments_points_positive CHECK (points_possible > 0);
ALTER TABLE assignments ADD CONSTRAINT assignments_status_valid CHECK (status IN ('draft', 'published', 'submitted', 'graded', 'returned'));

-- Enrollment table constraints
ALTER TABLE enrollments ADD CONSTRAINT enrollments_student_fk FOREIGN KEY (student_id) REFERENCES users(id);
ALTER TABLE enrollments ADD CONSTRAINT enrollments_class_fk FOREIGN KEY (class_id) REFERENCES classes(id);
ALTER TABLE enrollments ADD CONSTRAINT enrollments_unique UNIQUE (student_id, class_id);
ALTER TABLE enrollments ADD CONSTRAINT enrollments_status_valid CHECK (status IN ('active', 'inactive', 'completed', 'dropped', 'suspended'));

-- Submission table constraints
ALTER TABLE submissions ADD CONSTRAINT submissions_assignment_fk FOREIGN KEY (assignment_id) REFERENCES assignments(id);
ALTER TABLE submissions ADD CONSTRAINT submissions_student_fk FOREIGN KEY (student_id) REFERENCES users(id);
ALTER TABLE submissions ADD CONSTRAINT submissions_unique UNIQUE (assignment_id, student_id);
ALTER TABLE submissions ADD CONSTRAINT submissions_points_non_negative CHECK (points_earned IS NULL OR points_earned >= 0);

-- AI Usage table constraints
ALTER TABLE ai_usage ADD CONSTRAINT ai_usage_user_fk FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE ai_usage ADD CONSTRAINT ai_usage_school_fk FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE ai_usage ADD CONSTRAINT ai_usage_provider_valid CHECK (provider IN ('openrouter', 'ollama', 'gemini', 'openai', 'anthropic'));
ALTER TABLE ai_usage ADD CONSTRAINT ai_usage_request_type_valid CHECK (request_type IN ('chat', 'completion', 'embedding', 'image', 'audio'));
ALTER TABLE ai_usage ADD CONSTRAINT ai_usage_tokens_positive CHECK (tokens_used > 0);
ALTER TABLE ai_usage ADD CONSTRAINT ai_usage_cost_non_negative CHECK (cost >= 0);

-- Contact table constraints (CRM)
ALTER TABLE contacts ADD CONSTRAINT contacts_email_unique UNIQUE (email);
ALTER TABLE contacts ALTER COLUMN email SET NOT NULL;
ALTER TABLE contacts ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE contacts ALTER COLUMN last_name SET NOT NULL;
ALTER TABLE contacts ADD CONSTRAINT contacts_type_valid CHECK (contact_type IN ('lead', 'prospect', 'customer', 'partner', 'vendor'));
ALTER TABLE contacts ADD CONSTRAINT contacts_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Deal table constraints (CRM)
ALTER TABLE deals ADD CONSTRAINT deals_contact_fk FOREIGN KEY (contact_id) REFERENCES contacts(id);
ALTER TABLE deals ADD CONSTRAINT deals_owner_fk FOREIGN KEY (owner_id) REFERENCES users(id);
ALTER TABLE deals ALTER COLUMN title SET NOT NULL;
ALTER TABLE deals ADD CONSTRAINT deals_stage_valid CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'));
ALTER TABLE deals ADD CONSTRAINT deals_value_non_negative CHECK (value IS NULL OR value >= 0);
ALTER TABLE deals ADD CONSTRAINT deals_probability_range CHECK (probability >= 0 AND probability <= 100);

-- Campaign table constraints (CRM)
ALTER TABLE campaigns ALTER COLUMN name SET NOT NULL;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_owner_fk FOREIGN KEY (owner_id) REFERENCES users(id);
ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_valid CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled'));
ALTER TABLE campaigns ADD CONSTRAINT campaigns_budget_non_negative CHECK (budget IS NULL OR budget >= 0);

-- Notification table constraints
ALTER TABLE notifications ADD CONSTRAINT notifications_user_fk FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE notifications ADD CONSTRAINT notifications_school_fk FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE notifications ADD CONSTRAINT notifications_class_fk FOREIGN KEY (class_id) REFERENCES classes(id);
ALTER TABLE notifications ALTER COLUMN title SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN message SET NOT NULL;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_valid CHECK (notification_type IN ('info', 'success', 'warning', 'error', 'assignment', 'grade', 'announcement', 'reminder'));
ALTER TABLE notifications ADD CONSTRAINT notifications_priority_valid CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Analytics table constraints
ALTER TABLE analytics_events ADD CONSTRAINT analytics_user_fk FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE analytics_events ADD CONSTRAINT analytics_school_fk FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE analytics_events ALTER COLUMN session_id SET NOT NULL;
ALTER TABLE analytics_events ALTER COLUMN event_name SET NOT NULL;
ALTER TABLE analytics_events ALTER COLUMN event_category SET NOT NULL;
ALTER TABLE analytics_events ALTER COLUMN event_action SET NOT NULL;
ALTER TABLE analytics_events ADD CONSTRAINT analytics_event_value_non_negative CHECK (event_value IS NULL OR event_value >= 0);

-- Marketplace table constraints
ALTER TABLE marketplace_products ADD CONSTRAINT marketplace_creator_fk FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE marketplace_products ADD CONSTRAINT marketplace_school_fk FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE marketplace_products ALTER COLUMN name SET NOT NULL;
ALTER TABLE marketplace_products ALTER COLUMN sku SET NOT NULL;
ALTER TABLE marketplace_products ADD CONSTRAINT marketplace_sku_unique UNIQUE (sku);
ALTER TABLE marketplace_products ADD CONSTRAINT marketplace_price_positive CHECK (price > 0);
ALTER TABLE marketplace_products ADD CONSTRAINT marketplace_sale_price_positive CHECK (sale_price IS NULL OR sale_price > 0);
ALTER TABLE marketplace_products ADD CONSTRAINT marketplace_stock_non_negative CHECK (stock_quantity >= 0);
ALTER TABLE marketplace_products ADD CONSTRAINT marketplace_status_valid CHECK (status IN ('draft', 'published', 'private'));
ALTER TABLE marketplace_products ADD CONSTRAINT marketplace_visibility_valid CHECK (visibility IN ('visible', 'catalog', 'search', 'hidden'));
ALTER TABLE marketplace_products ADD CONSTRAINT marketplace_stock_status_valid CHECK (stock_status IN ('in_stock', 'out_of_stock', 'on_backorder'));

-- Support ticket table constraints
ALTER TABLE support_tickets ADD CONSTRAINT support_user_fk FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE support_tickets ADD CONSTRAINT support_assigned_fk FOREIGN KEY (assigned_to) REFERENCES users(id);
ALTER TABLE support_tickets ADD CONSTRAINT support_school_fk FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE support_tickets ALTER COLUMN subject SET NOT NULL;
ALTER TABLE support_tickets ALTER COLUMN description SET NOT NULL;
ALTER TABLE support_tickets ADD CONSTRAINT support_priority_valid CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE support_tickets ADD CONSTRAINT support_status_valid CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'));

-- System settings table constraints
ALTER TABLE system_settings ALTER COLUMN key SET NOT NULL;
ALTER TABLE system_settings ADD CONSTRAINT system_settings_key_unique UNIQUE (key);

-- User settings table constraints
ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_fk FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE user_settings ALTER COLUMN key SET NOT NULL;
ALTER TABLE user_settings ADD CONSTRAINT user_settings_unique UNIQUE (user_id, key);

-- Webhook endpoints table constraints
ALTER TABLE webhook_endpoints ALTER COLUMN url SET NOT NULL;
ALTER TABLE webhook_endpoints ALTER COLUMN secret SET NOT NULL;
ALTER TABLE webhook_endpoints ADD CONSTRAINT webhook_url_format CHECK (url ~* '^https?://');
ALTER TABLE webhook_endpoints ADD CONSTRAINT webhook_secret_length CHECK (length(secret) >= 16);

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_schools_principal_id ON schools(principal_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_schools_school_type ON schools(school_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_schools_is_active ON schools(is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_school_id ON courses(school_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_academic_year ON courses(academic_year);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classes_course_id ON classes(course_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assignments_class_id ON assignments(class_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assignments_status ON assignments(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_class_id ON enrollments(class_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_status ON enrollments(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_school_id ON ai_usage(school_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_provider ON ai_usage(provider);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_created_at ON ai_usage(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_usage_user_date ON ai_usage(user_id, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_type ON contacts(contact_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_company ON contacts(company);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_source ON contacts(source);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_is_active ON contacts(is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_owner_id ON deals(owner_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_expected_close_date ON deals(expected_close_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_is_active ON deals(is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_owner_id ON campaigns(owner_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_start_date ON campaigns(start_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_end_date ON campaigns(end_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_school_id ON notifications(school_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_school_id ON analytics_events(school_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_event_category ON analytics_events(event_category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_created_by ON marketplace_products(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_school_id ON marketplace_products(school_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_status ON marketplace_products(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_featured ON marketplace_products(featured);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_price ON marketplace_products(price);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_user_id ON support_tickets(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_assigned_to ON support_tickets(assigned_to);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_school_id ON support_tickets(school_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_status ON support_tickets(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_priority ON support_tickets(priority);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_created_at ON support_tickets(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_settings_key ON user_settings(key);

-- Create audit log table for tracking data changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Add constraint validation triggers (PostgreSQL functions)
CREATE OR REPLACE FUNCTION validate_admin_mfa()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IN ('admin', 'super_admin') AND (NEW.mfa_enabled IS NULL OR NEW.mfa_enabled = false) THEN
        RAISE EXCEPTION 'Multi-factor authentication is required for admin users';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_admin_mfa
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION validate_admin_mfa();

CREATE OR REPLACE FUNCTION validate_principal_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.principal_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM users 
            WHERE id = NEW.principal_id 
            AND role IN ('principal', 'admin', 'super_admin')
            AND deleted_at IS NULL
        ) THEN
            RAISE EXCEPTION 'Principal must have appropriate role (principal, admin, or super_admin)';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_principal_role
    BEFORE INSERT OR UPDATE ON schools
    FOR EACH ROW
    EXECUTE FUNCTION validate_principal_role();

CREATE OR REPLACE FUNCTION validate_teacher_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.teacher_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM users 
            WHERE id = NEW.teacher_id 
            AND role IN ('teacher', 'admin', 'super_admin')
            AND deleted_at IS NULL
        ) THEN
            RAISE EXCEPTION 'Teacher must have appropriate role (teacher, admin, or super_admin)';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_teacher_role_courses
    BEFORE INSERT OR UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION validate_teacher_role();

CREATE TRIGGER trigger_validate_teacher_role_classes
    BEFORE INSERT OR UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION validate_teacher_role();

CREATE OR REPLACE FUNCTION validate_student_enrollment()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.student_id 
        AND role = 'student'
        AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Only students can be enrolled in classes';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_student_enrollment
    BEFORE INSERT OR UPDATE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION validate_student_enrollment();

CREATE OR REPLACE FUNCTION validate_submission_enrollment()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM enrollments e 
        JOIN assignments a ON e.class_id = a.class_id 
        WHERE e.student_id = NEW.student_id 
        AND a.id = NEW.assignment_id 
        AND e.status = 'active'
        AND e.deleted_at IS NULL
        AND a.deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Student must be enrolled in the class to submit assignments';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_submission_enrollment
    BEFORE INSERT OR UPDATE ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION validate_submission_enrollment();

CREATE OR REPLACE FUNCTION validate_deal_close_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stage IN ('closed_won', 'closed_lost') AND NEW.actual_close_date IS NULL THEN
        RAISE EXCEPTION 'Closed deals must have an actual close date';
    END IF;
    
    IF NEW.stage NOT IN ('closed_won', 'closed_lost') AND NEW.actual_close_date IS NOT NULL THEN
        RAISE EXCEPTION 'Open deals cannot have an actual close date';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_deal_close_date
    BEFORE INSERT OR UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION validate_deal_close_date();

CREATE OR REPLACE FUNCTION validate_campaign_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL AND NEW.start_date > NEW.end_date THEN
        RAISE EXCEPTION 'Campaign end date must be after start date';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_campaign_dates
    BEFORE INSERT OR UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION validate_campaign_dates();

CREATE OR REPLACE FUNCTION validate_ollama_cost()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.provider = 'ollama' AND NEW.cost > 0 THEN
        RAISE EXCEPTION 'Ollama usage should have zero cost';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_ollama_cost
    BEFORE INSERT OR UPDATE ON ai_usage
    FOR EACH ROW
    EXECUTE FUNCTION validate_ollama_cost();

-- Create function to log data changes for audit trail
CREATE OR REPLACE FUNCTION log_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        COALESCE(NEW.updated_by, NEW.created_by, OLD.updated_by, OLD.created_by),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) 
             WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW) 
             ELSE NULL END,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit logging to critical tables
CREATE TRIGGER trigger_audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_data_changes();

CREATE TRIGGER trigger_audit_schools
    AFTER INSERT OR UPDATE OR DELETE ON schools
    FOR EACH ROW
    EXECUTE FUNCTION log_data_changes();

CREATE TRIGGER trigger_audit_deals
    AFTER INSERT OR UPDATE OR DELETE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION log_data_changes();

CREATE TRIGGER trigger_audit_ai_usage
    AFTER INSERT OR UPDATE OR DELETE ON ai_usage
    FOR EACH ROW
    EXECUTE FUNCTION log_data_changes();

-- Add comments for documentation
COMMENT ON TABLE audit_logs IS 'Audit trail for tracking all data changes';
COMMENT ON COLUMN audit_logs.action IS 'Type of operation: INSERT, UPDATE, or DELETE';
COMMENT ON COLUMN audit_logs.resource_type IS 'Table name where the change occurred';
COMMENT ON COLUMN audit_logs.resource_id IS 'Primary key of the affected record';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous values before the change (for UPDATE and DELETE)';
COMMENT ON COLUMN audit_logs.new_values IS 'New values after the change (for INSERT and UPDATE)';

-- Create a view for easy constraint monitoring
CREATE OR REPLACE VIEW constraint_violations AS
SELECT 
    'users' as table_name,
    'admin_without_mfa' as violation_type,
    COUNT(*) as violation_count
FROM users 
WHERE role IN ('admin', 'super_admin') 
AND (mfa_enabled IS NULL OR mfa_enabled = false)
AND deleted_at IS NULL

UNION ALL

SELECT 
    'schools' as table_name,
    'invalid_principal_role' as violation_type,
    COUNT(*) as violation_count
FROM schools s
LEFT JOIN users u ON s.principal_id = u.id
WHERE s.principal_id IS NOT NULL
AND s.deleted_at IS NULL
AND (u.id IS NULL OR u.role NOT IN ('principal', 'admin', 'super_admin') OR u.deleted_at IS NOT NULL)

UNION ALL

SELECT 
    'enrollments' as table_name,
    'non_student_enrolled' as violation_type,
    COUNT(*) as violation_count
FROM enrollments e
JOIN users u ON e.student_id = u.id
WHERE e.deleted_at IS NULL
AND u.role != 'student'

UNION ALL

SELECT 
    'deals' as table_name,
    'closed_without_date' as violation_type,
    COUNT(*) as violation_count
FROM deals
WHERE stage IN ('closed_won', 'closed_lost')
AND actual_close_date IS NULL
AND deleted_at IS NULL

UNION ALL

SELECT 
    'ai_usage' as table_name,
    'ollama_with_cost' as violation_type,
    COUNT(*) as violation_count
FROM ai_usage
WHERE provider = 'ollama'
AND cost > 0;

COMMENT ON VIEW constraint_violations IS 'Monitor business rule constraint violations across all tables';