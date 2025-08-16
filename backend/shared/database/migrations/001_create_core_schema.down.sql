-- Rollback Core Database Schema
-- This migration removes all tables and types created in the up migration

-- Drop triggers first
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;
DROP TRIGGER IF EXISTS update_assignments_updated_at ON assignments;
DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS deals;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS ai_usage;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS schools;
DROP TABLE IF EXISTS users;

-- Drop custom types
DROP TYPE IF EXISTS enrollment_status;
DROP TYPE IF EXISTS assignment_status;
DROP TYPE IF EXISTS campaign_status;
DROP TYPE IF EXISTS deal_stage;
DROP TYPE IF EXISTS contact_type;
DROP TYPE IF EXISTS ai_request_type;
DROP TYPE IF EXISTS ai_provider;
DROP TYPE IF EXISTS school_type;
DROP TYPE IF EXISTS user_role;