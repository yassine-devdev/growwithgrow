/**
 * Comprehensive Zod validation schemas for all data models
 * Provides server-side validation and sanitization
 */

import { z } from 'zod';

// Base validation helpers
const emailSchema = z.string().email().toLowerCase().trim();
const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)\.]{10,20}$/).optional();
const urlSchema = z.string().url().optional();
const uuidSchema = z.string().uuid();
const positiveIntSchema = z.number().int().positive();
const nonNegativeIntSchema = z.number().int().min(0);
const nonEmptyStringSchema = z.string().min(1).trim();
const optionalStringSchema = z.string().trim().optional();

// Custom validation functions
const sanitizeHtml = (value: string) => {
  // Basic HTML sanitization - in production use a library like DOMPurify
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

const sanitizeString = z.string().transform(sanitizeHtml);

// Enum schemas
export const UserRoleSchema = z.enum([
  'student', 'teacher', 'admin', 'parent', 'principal', 'super_admin'
]);

export const SchoolTypeSchema = z.enum([
  'elementary', 'middle', 'high', 'university', 'vocational', 'other'
]);

export const AIProviderSchema = z.enum([
  'openrouter', 'ollama', 'gemini', 'openai', 'anthropic'
]);

export const AIRequestTypeSchema = z.enum([
  'chat', 'completion', 'embedding', 'image', 'audio'
]);

export const ContactTypeSchema = z.enum([
  'lead', 'prospect', 'customer', 'partner', 'vendor'
]);

export const DealStageSchema = z.enum([
  'lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
]);

export const CampaignStatusSchema = z.enum([
  'draft', 'active', 'paused', 'completed', 'cancelled'
]);

export const AssignmentStatusSchema = z.enum([
  'draft', 'published', 'submitted', 'graded', 'returned'
]);

export const EnrollmentStatusSchema = z.enum([
  'active', 'inactive', 'completed', 'dropped', 'suspended'
]);

// User validation schemas
export const CreateUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
  firstName: nonEmptyStringSchema.max(100),
  lastName: nonEmptyStringSchema.max(100),
  role: UserRoleSchema.default('student'),
  phone: phoneSchema,
  dateOfBirth: z.date().max(new Date()).optional(),
  address: optionalStringSchema.max(500),
  city: optionalStringSchema.max(100),
  state: optionalStringSchema.max(100),
  country: optionalStringSchema.max(100),
  postalCode: optionalStringSchema.max(20),
  preferences: z.record(z.any()).default({}),
  metadata: z.record(z.any()).default({})
});

export const UpdateUserSchema = CreateUserSchema.partial().omit({ 
  email: true, 
  password: true 
});

export const UserLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128)
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// School validation schemas
export const CreateSchoolSchema = z.object({
  name: nonEmptyStringSchema.max(255),
  schoolType: SchoolTypeSchema,
  address: optionalStringSchema.max(500),
  city: optionalStringSchema.max(100),
  state: optionalStringSchema.max(100),
  country: optionalStringSchema.max(100),
  postalCode: optionalStringSchema.max(20),
  phone: phoneSchema,
  email: emailSchema.optional(),
  website: urlSchema,
  principalId: positiveIntSchema.optional(),
  settings: z.record(z.any()).default({}),
  metadata: z.record(z.any()).default({})
});

export const UpdateSchoolSchema = CreateSchoolSchema.partial();

// Course validation schemas
export const CreateCourseSchema = z.object({
  schoolId: positiveIntSchema,
  name: nonEmptyStringSchema.max(255),
  code: optionalStringSchema.max(50),
  description: sanitizeString.optional(),
  teacherId: positiveIntSchema.optional(),
  credits: nonNegativeIntSchema.default(0),
  semester: optionalStringSchema.max(50),
  academicYear: optionalStringSchema.max(20),
  settings: z.record(z.any()).default({}),
  metadata: z.record(z.any()).default({})
});

export const UpdateCourseSchema = CreateCourseSchema.partial().omit({ schoolId: true });

// Class validation schemas
export const CreateClassSchema = z.object({
  courseId: positiveIntSchema,
  name: nonEmptyStringSchema.max(255),
  section: optionalStringSchema.max(10),
  teacherId: positiveIntSchema.optional(),
  room: optionalStringSchema.max(100),
  schedule: z.record(z.any()).optional(),
  maxStudents: positiveIntSchema.default(30),
  settings: z.record(z.any()).default({}),
  metadata: z.record(z.any()).default({})
});

export const UpdateClassSchema = CreateClassSchema.partial().omit({ courseId: true });

// Assignment validation schemas
export const CreateAssignmentSchema = z.object({
  classId: positiveIntSchema,
  title: nonEmptyStringSchema.max(255),
  description: sanitizeString.optional(),
  instructions: sanitizeString.optional(),
  dueDate: z.date().min(new Date()).optional(),
  pointsPossible: positiveIntSchema.default(100),
  status: AssignmentStatusSchema.default('draft'),
  settings: z.record(z.any()).default({}),
  metadata: z.record(z.any()).default({})
});

export const UpdateAssignmentSchema = CreateAssignmentSchema.partial().omit({ classId: true });

// Enrollment validation schemas
export const CreateEnrollmentSchema = z.object({
  studentId: positiveIntSchema,
  classId: positiveIntSchema,
  status: EnrollmentStatusSchema.default('active'),
  enrolledAt: z.date().default(() => new Date()),
  metadata: z.record(z.any()).default({})
});

export const UpdateEnrollmentSchema = CreateEnrollmentSchema.partial().omit({ 
  studentId: true, 
  classId: true 
});

// Submission validation schemas
export const CreateSubmissionSchema = z.object({
  assignmentId: positiveIntSchema,
  studentId: positiveIntSchema,
  content: sanitizeString.optional(),
  fileUrls: z.array(urlSchema).default([]),
  submittedAt: z.date().default(() => new Date()),
  metadata: z.record(z.any()).default({})
});

export const UpdateSubmissionSchema = z.object({
  content: sanitizeString.optional(),
  fileUrls: z.array(urlSchema).optional(),
  grade: optionalStringSchema.max(5),
  pointsEarned: nonNegativeIntSchema.optional(),
  feedback: sanitizeString.optional(),
  gradedAt: z.date().optional(),
  metadata: z.record(z.any()).optional()
});

// AI Usage validation schemas
export const CreateAIUsageSchema = z.object({
  userId: positiveIntSchema.optional(),
  schoolId: positiveIntSchema.optional(),
  provider: AIProviderSchema,
  modelName: nonEmptyStringSchema.max(100),
  requestType: AIRequestTypeSchema,
  tokensUsed: positiveIntSchema,
  cost: z.number().min(0),
  conversationId: positiveIntSchema.optional(),
  promptText: sanitizeString.optional(),
  responseText: sanitizeString.optional(),
  metadata: z.record(z.any()).default({})
});

// Contact validation schemas
export const CreateContactSchema = z.object({
  firstName: nonEmptyStringSchema.max(100),
  lastName: nonEmptyStringSchema.max(100),
  email: emailSchema,
  phone: phoneSchema,
  company: optionalStringSchema.max(255),
  jobTitle: optionalStringSchema.max(100),
  contactType: ContactTypeSchema.default('lead'),
  source: optionalStringSchema.max(100),
  tags: z.array(z.string()).default([]),
  notes: sanitizeString.optional(),
  metadata: z.record(z.any()).default({})
});

export const UpdateContactSchema = CreateContactSchema.partial().omit({ email: true });

// Deal validation schemas
export const CreateDealSchema = z.object({
  contactId: positiveIntSchema.optional(),
  title: nonEmptyStringSchema.max(255),
  description: sanitizeString.optional(),
  value: z.number().positive().optional(),
  stage: DealStageSchema.default('lead'),
  probability: z.number().min(0).max(100).default(0),
  expectedCloseDate: z.date().min(new Date()).optional(),
  ownerId: positiveIntSchema.optional(),
  metadata: z.record(z.any()).default({})
});

export const UpdateDealSchema = CreateDealSchema.partial();

// Campaign validation schemas
export const CreateCampaignSchema = z.object({
  name: nonEmptyStringSchema.max(255),
  description: sanitizeString.optional(),
  campaignType: nonEmptyStringSchema.max(50),
  status: CampaignStatusSchema.default('draft'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.number().positive().optional(),
  targetAudience: z.record(z.any()).default({}),
  settings: z.record(z.any()).default({}),
  ownerId: positiveIntSchema.optional(),
  metadata: z.record(z.any()).default({})
}).refine(data => {
  if (data.startDate && data.endDate) {
    return data.startDate <= data.endDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

export const UpdateCampaignSchema = CreateCampaignSchema.partial();

// Notification validation schemas
export const CreateNotificationSchema = z.object({
  userId: positiveIntSchema,
  title: nonEmptyStringSchema.max(255),
  message: nonEmptyStringSchema,
  notificationType: z.enum([
    'info', 'success', 'warning', 'error', 'assignment', 'grade', 'announcement', 'reminder'
  ]),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  data: z.record(z.any()).default({}),
  actionUrl: urlSchema,
  schoolId: positiveIntSchema.optional(),
  classId: positiveIntSchema.optional(),
  expiresAt: z.date().optional()
});

// Analytics validation schemas
export const CreateAnalyticsEventSchema = z.object({
  userId: positiveIntSchema.optional(),
  sessionId: nonEmptyStringSchema.max(255),
  eventName: nonEmptyStringSchema.max(100),
  eventCategory: nonEmptyStringSchema.max(50),
  eventAction: nonEmptyStringSchema.max(50),
  eventLabel: optionalStringSchema.max(100),
  eventValue: nonNegativeIntSchema.optional(),
  properties: z.record(z.any()).default({}),
  pageUrl: urlSchema.optional(),
  pageTitle: optionalStringSchema.max(255),
  referrer: urlSchema.optional(),
  userAgent: optionalStringSchema,
  ipAddress: z.string().ip().optional(),
  country: optionalStringSchema.max(100),
  city: optionalStringSchema.max(100),
  deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  browser: optionalStringSchema.max(50),
  os: optionalStringSchema.max(50),
  schoolId: positiveIntSchema.optional()
});

// Marketplace validation schemas
export const CreateMarketplaceProductSchema = z.object({
  name: nonEmptyStringSchema.max(255),
  description: sanitizeString.optional(),
  shortDescription: sanitizeString.optional(),
  sku: nonEmptyStringSchema.max(100),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  categoryId: positiveIntSchema.optional(),
  brand: optionalStringSchema.max(100),
  weight: z.number().positive().optional(),
  dimensions: z.record(z.number()).default({}),
  images: z.array(urlSchema).default([]),
  tags: z.array(z.string()).default([]),
  stockQuantity: nonNegativeIntSchema.default(0),
  stockStatus: z.enum(['in_stock', 'out_of_stock', 'on_backorder']).default('in_stock'),
  manageStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'private']).default('draft'),
  visibility: z.enum(['visible', 'catalog', 'search', 'hidden']).default('visible'),
  createdBy: positiveIntSchema,
  schoolId: positiveIntSchema.optional(),
  metadata: z.record(z.any()).default({})
});

export const UpdateMarketplaceProductSchema = CreateMarketplaceProductSchema.partial().omit({ 
  sku: true, 
  createdBy: true 
});

// Support ticket validation schemas
export const CreateSupportTicketSchema = z.object({
  userId: positiveIntSchema,
  subject: nonEmptyStringSchema.max(255),
  description: sanitizeString,
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  category: optionalStringSchema.max(100),
  schoolId: positiveIntSchema.optional(),
  metadata: z.record(z.any()).default({})
});

export const UpdateSupportTicketSchema = z.object({
  subject: optionalStringSchema.max(255),
  description: sanitizeString.optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  category: optionalStringSchema.max(100),
  assignedTo: positiveIntSchema.optional(),
  metadata: z.record(z.any()).optional()
});

// System settings validation schemas
export const CreateSystemSettingSchema = z.object({
  key: nonEmptyStringSchema.max(255),
  value: z.any(),
  description: optionalStringSchema,
  isPublic: z.boolean().default(false)
});

export const UpdateSystemSettingSchema = CreateSystemSettingSchema.partial().omit({ key: true });

// User settings validation schemas
export const CreateUserSettingSchema = z.object({
  userId: positiveIntSchema,
  key: nonEmptyStringSchema.max(255),
  value: z.any()
});

export const UpdateUserSettingSchema = CreateUserSettingSchema.partial().omit({ 
  userId: true, 
  key: true 
});

// Bulk operation schemas
export const BulkDeleteSchema = z.object({
  ids: z.array(positiveIntSchema).min(1).max(1000),
  reason: optionalStringSchema.max(500)
});

export const BulkUpdateSchema = z.object({
  ids: z.array(positiveIntSchema).min(1).max(1000),
  updates: z.record(z.any()),
  reason: optionalStringSchema.max(500)
});

// Search and filter schemas
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: optionalStringSchema,
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const SearchSchema = z.object({
  query: optionalStringSchema.max(500),
  filters: z.record(z.any()).default({}),
  ...PaginationSchema.shape
});

// File upload schemas
export const FileUploadSchema = z.object({
  filename: nonEmptyStringSchema.max(255),
  mimetype: nonEmptyStringSchema.max(100),
  size: positiveIntSchema.max(50 * 1024 * 1024), // 50MB max
  url: urlSchema
});

export const MultipleFileUploadSchema = z.object({
  files: z.array(FileUploadSchema).min(1).max(10)
});

// Export all schemas for easy access
export const ValidationSchemas = {
  // User schemas
  CreateUser: CreateUserSchema,
  UpdateUser: UpdateUserSchema,
  UserLogin: UserLoginSchema,
  ChangePassword: ChangePasswordSchema,

  // School schemas
  CreateSchool: CreateSchoolSchema,
  UpdateSchool: UpdateSchoolSchema,

  // Course schemas
  CreateCourse: CreateCourseSchema,
  UpdateCourse: UpdateCourseSchema,

  // Class schemas
  CreateClass: CreateClassSchema,
  UpdateClass: UpdateClassSchema,

  // Assignment schemas
  CreateAssignment: CreateAssignmentSchema,
  UpdateAssignment: UpdateAssignmentSchema,

  // Enrollment schemas
  CreateEnrollment: CreateEnrollmentSchema,
  UpdateEnrollment: UpdateEnrollmentSchema,

  // Submission schemas
  CreateSubmission: CreateSubmissionSchema,
  UpdateSubmission: UpdateSubmissionSchema,

  // AI Usage schemas
  CreateAIUsage: CreateAIUsageSchema,

  // Contact schemas
  CreateContact: CreateContactSchema,
  UpdateContact: UpdateContactSchema,

  // Deal schemas
  CreateDeal: CreateDealSchema,
  UpdateDeal: UpdateDealSchema,

  // Campaign schemas
  CreateCampaign: CreateCampaignSchema,
  UpdateCampaign: UpdateCampaignSchema,

  // Notification schemas
  CreateNotification: CreateNotificationSchema,

  // Analytics schemas
  CreateAnalyticsEvent: CreateAnalyticsEventSchema,

  // Marketplace schemas
  CreateMarketplaceProduct: CreateMarketplaceProductSchema,
  UpdateMarketplaceProduct: UpdateMarketplaceProductSchema,

  // Support schemas
  CreateSupportTicket: CreateSupportTicketSchema,
  UpdateSupportTicket: UpdateSupportTicketSchema,

  // Settings schemas
  CreateSystemSetting: CreateSystemSettingSchema,
  UpdateSystemSetting: UpdateSystemSettingSchema,
  CreateUserSetting: CreateUserSettingSchema,
  UpdateUserSetting: UpdateUserSettingSchema,

  // Utility schemas
  BulkDelete: BulkDeleteSchema,
  BulkUpdate: BulkUpdateSchema,
  Pagination: PaginationSchema,
  Search: SearchSchema,
  FileUpload: FileUploadSchema,
  MultipleFileUpload: MultipleFileUploadSchema
};

export default ValidationSchemas;