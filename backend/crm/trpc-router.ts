import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc/router';
import { PaginationSchema } from '../shared/types';
import { crmDB } from './db';

// Zod schemas for CRM operations
const ContactSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  contactType: z.enum(['lead', 'customer', 'partner', 'vendor']),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateContactInputSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  contactType: z.enum(['lead', 'customer', 'partner', 'vendor']),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const UpdateContactInputSchema = z.object({
  id: z.number(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  contactType: z.enum(['lead', 'customer', 'partner', 'vendor']).optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

const LeadSchema = z.object({
  id: z.number(),
  contactId: z.number(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  score: z.number(),
  source: z.string().optional(),
  campaign: z.string().optional(),
  estimatedValue: z.number().optional(),
  probability: z.number(),
  expectedCloseDate: z.string().optional(),
  assignedTo: z.number().optional(),
  lastActivityDate: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateLeadInputSchema = z.object({
  contactId: z.number(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).default('new'),
  score: z.number().min(0).max(100).default(0),
  source: z.string().optional(),
  campaign: z.string().optional(),
  estimatedValue: z.number().min(0).optional(),
  probability: z.number().min(0).max(100).default(10),
  expectedCloseDate: z.string().datetime().optional(),
  assignedTo: z.number().optional(),
  notes: z.string().optional(),
});

const AccountSchema = z.object({
  id: z.number(),
  name: z.string(),
  accountType: z.enum(['school', 'district', 'organization', 'individual']),
  industry: z.string().optional(),
  size: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
  annualRevenue: z.number().optional(),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  primaryContactId: z.number().optional(),
  accountManagerId: z.number().optional(),
  status: z.enum(['active', 'inactive', 'prospect', 'customer']),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateAccountInputSchema = z.object({
  name: z.string().min(1).max(255),
  accountType: z.enum(['school', 'district', 'organization', 'individual']),
  industry: z.string().optional(),
  size: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
  annualRevenue: z.number().min(0).optional(),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  primaryContactId: z.number().optional(),
  accountManagerId: z.number().optional(),
  status: z.enum(['active', 'inactive', 'prospect', 'customer']).default('prospect'),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});const
 DealSchema = z.object({
  id: z.number(),
  name: z.string(),
  accountId: z.number(),
  contactId: z.number().optional(),
  stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  amount: z.number(),
  probability: z.number(),
  expectedCloseDate: z.string().optional(),
  actualCloseDate: z.string().optional(),
  ownerId: z.number(),
  source: z.string().optional(),
  description: z.string().optional(),
  nextStep: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateDealInputSchema = z.object({
  name: z.string().min(1).max(255),
  accountId: z.number(),
  contactId: z.number().optional(),
  stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).default('prospecting'),
  amount: z.number().min(0),
  probability: z.number().min(0).max(100).default(10),
  expectedCloseDate: z.string().datetime().optional(),
  source: z.string().optional(),
  description: z.string().optional(),
  nextStep: z.string().optional(),
});

const CampaignSchema = z.object({
  id: z.number(),
  name: z.string(),
  campaignType: z.enum(['email', 'sms', 'social', 'webinar', 'event', 'direct_mail']),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().optional(),
  targetAudience: z.string().optional(),
  description: z.string().optional(),
  goals: z.string().optional(),
  ownerId: z.number(),
  metrics: z.any().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateCampaignInputSchema = z.object({
  name: z.string().min(1).max(255),
  campaignType: z.enum(['email', 'sms', 'social', 'webinar', 'event', 'direct_mail']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().min(0).optional(),
  targetAudience: z.string().optional(),
  description: z.string().optional(),
  goals: z.string().optional(),
});

// CRM router implementation
export const crmRouter = router({
  // Contact management
  contacts: router({
    // List contacts with filtering and pagination
    list: protectedProcedure
      .input(z.object({
        contactType: z.enum(['lead', 'customer', 'partner', 'vendor']).optional(),
        search: z.string().optional(),
        company: z.string().optional(),
        source: z.string().optional(),
        isActive: z.boolean().optional(),
      }).merge(PaginationSchema))
      .output(z.object({
        contacts: z.array(ContactSchema),
        total: z.number(),
        hasMore: z.boolean(),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE c.is_active = TRUE";
        const params: any[] = [];
        let paramIndex = 1;

        if (input.contactType) {
          whereClause += ` AND c.contact_type = $${paramIndex}`;
          params.push(input.contactType);
          paramIndex++;
        }

        if (input.search) {
          whereClause += ` AND (c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.company ILIKE $${paramIndex})`;
          params.push(`%${input.search}%`);
          paramIndex++;
        }

        if (input.company) {
          whereClause += ` AND c.company ILIKE $${paramIndex}`;
          params.push(`%${input.company}%`);
          paramIndex++;
        }

        if (input.source) {
          whereClause += ` AND c.source = $${paramIndex}`;
          params.push(input.source);
          paramIndex++;
        }

        if (input.isActive !== undefined) {
          whereClause = whereClause.replace("c.is_active = TRUE", `c.is_active = $${paramIndex}`);
          params.push(input.isActive);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM contacts c ${whereClause}`;
        const countResult = await crmDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            c.id,
            c.first_name as "firstName",
            c.last_name as "lastName",
            c.email,
            c.phone,
            c.company,
            c.job_title as "jobTitle",
            c.address,
            c.city,
            c.state,
            c.country,
            c.postal_code as "postalCode",
            c.contact_type as "contactType",
            c.source,
            c.tags,
            c.notes,
            c.is_active as "isActive",
            c.created_at as "createdAt",
            c.updated_at as "updatedAt"
          FROM contacts c
          ${whereClause}
          ORDER BY c.created_at DESC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const contacts = await crmDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          contacts: contacts.map(contact => ({
            ...contact,
            createdAt: contact.createdAt.toISOString(),
            updatedAt: contact.updatedAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Get contact by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .output(ContactSchema)
      .query(async ({ input, ctx }) => {
        const query = `
          SELECT 
            id,
            first_name as "firstName",
            last_name as "lastName",
            email,
            phone,
            company,
            job_title as "jobTitle",
            address,
            city,
            state,
            country,
            postal_code as "postalCode",
            contact_type as "contactType",
            source,
            tags,
            notes,
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM contacts
          WHERE id = $1 AND is_active = TRUE
        `;

        const contact = await crmDB.queryRow<any>(query, input.id);

        if (!contact) {
          throw new Error('Contact not found');
        }

        return {
          ...contact,
          createdAt: contact.createdAt.toISOString(),
          updatedAt: contact.updatedAt.toISOString(),
        };
      }),    
// Create contact
    create: protectedProcedure
      .input(CreateContactInputSchema)
      .output(ContactSchema)
      .mutation(async ({ input, ctx }) => {
        const query = `
          INSERT INTO contacts (
            first_name, last_name, email, phone, company, job_title,
            address, city, state, country, postal_code, contact_type,
            source, tags, notes, is_active, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true, NOW(), NOW())
          RETURNING 
            id,
            first_name as "firstName",
            last_name as "lastName",
            email,
            phone,
            company,
            job_title as "jobTitle",
            address,
            city,
            state,
            country,
            postal_code as "postalCode",
            contact_type as "contactType",
            source,
            tags,
            notes,
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const contact = await crmDB.queryRow<any>(query,
          input.firstName,
          input.lastName,
          input.email,
          input.phone,
          input.company,
          input.jobTitle,
          input.address,
          input.city,
          input.state,
          input.country,
          input.postalCode,
          input.contactType,
          input.source,
          input.tags ? JSON.stringify(input.tags) : null,
          input.notes
        );

        if (!contact) {
          throw new Error('Failed to create contact');
        }

        return {
          ...contact,
          createdAt: contact.createdAt.toISOString(),
          updatedAt: contact.updatedAt.toISOString(),
        };
      }),

    // Update contact
    update: protectedProcedure
      .input(UpdateContactInputSchema)
      .output(ContactSchema)
      .mutation(async ({ input, ctx }) => {
        const updateFields: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        // Build dynamic update query
        Object.entries(input).forEach(([key, value]) => {
          if (key !== 'id' && value !== undefined) {
            const dbField = key === 'firstName' ? 'first_name' :
                           key === 'lastName' ? 'last_name' :
                           key === 'jobTitle' ? 'job_title' :
                           key === 'postalCode' ? 'postal_code' :
                           key === 'contactType' ? 'contact_type' :
                           key === 'isActive' ? 'is_active' : key;
            
            updateFields.push(`${dbField} = $${paramIndex}`);
            params.push(key === 'tags' && Array.isArray(value) ? JSON.stringify(value) : value);
            paramIndex++;
          }
        });

        if (updateFields.length === 0) {
          throw new Error('No fields to update');
        }

        updateFields.push(`updated_at = NOW()`);
        params.push(input.id);

        const query = `
          UPDATE contacts 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING 
            id,
            first_name as "firstName",
            last_name as "lastName",
            email,
            phone,
            company,
            job_title as "jobTitle",
            address,
            city,
            state,
            country,
            postal_code as "postalCode",
            contact_type as "contactType",
            source,
            tags,
            notes,
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const contact = await crmDB.queryRow<any>(query, ...params);

        if (!contact) {
          throw new Error('Contact not found or update failed');
        }

        return {
          ...contact,
          createdAt: contact.createdAt.toISOString(),
          updatedAt: contact.updatedAt.toISOString(),
        };
      }),

    // Delete contact (soft delete)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .output(z.object({ success: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const query = `
          UPDATE contacts 
          SET is_active = false, updated_at = NOW()
          WHERE id = $1
        `;

        await crmDB.exec(query, input.id);

        return { success: true };
      }),
  }),

  // Lead management
  leads: router({
    // List leads
    list: protectedProcedure
      .input(z.object({
        status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
        assignedTo: z.number().optional(),
        source: z.string().optional(),
        minScore: z.number().optional(),
        maxScore: z.number().optional(),
      }).merge(PaginationSchema))
      .output(z.object({
        leads: z.array(LeadSchema),
        total: z.number(),
        hasMore: z.boolean(),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE l.is_active = TRUE";
        const params: any[] = [];
        let paramIndex = 1;

        if (input.status) {
          whereClause += ` AND l.status = $${paramIndex}`;
          params.push(input.status);
          paramIndex++;
        }

        if (input.assignedTo) {
          whereClause += ` AND l.assigned_to = $${paramIndex}`;
          params.push(input.assignedTo);
          paramIndex++;
        }

        if (input.source) {
          whereClause += ` AND l.source = $${paramIndex}`;
          params.push(input.source);
          paramIndex++;
        }

        if (input.minScore !== undefined) {
          whereClause += ` AND l.score >= $${paramIndex}`;
          params.push(input.minScore);
          paramIndex++;
        }

        if (input.maxScore !== undefined) {
          whereClause += ` AND l.score <= $${paramIndex}`;
          params.push(input.maxScore);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM leads l ${whereClause}`;
        const countResult = await crmDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            l.id,
            l.contact_id as "contactId",
            l.status,
            l.score,
            l.source,
            l.campaign,
            l.estimated_value as "estimatedValue",
            l.probability,
            l.expected_close_date as "expectedCloseDate",
            l.assigned_to as "assignedTo",
            l.last_activity_date as "lastActivityDate",
            l.notes,
            l.is_active as "isActive",
            l.created_at as "createdAt",
            l.updated_at as "updatedAt"
          FROM leads l
          ${whereClause}
          ORDER BY l.score DESC, l.created_at DESC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const leads = await crmDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          leads: leads.map(lead => ({
            ...lead,
            expectedCloseDate: lead.expectedCloseDate?.toISOString(),
            lastActivityDate: lead.lastActivityDate?.toISOString(),
            createdAt: lead.createdAt.toISOString(),
            updatedAt: lead.updatedAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Create lead
    create: protectedProcedure
      .input(CreateLeadInputSchema)
      .output(LeadSchema)
      .mutation(async ({ input, ctx }) => {
        const query = `
          INSERT INTO leads (
            contact_id, status, score, source, campaign, estimated_value,
            probability, expected_close_date, assigned_to, notes,
            is_active, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW(), NOW())
          RETURNING 
            id,
            contact_id as "contactId",
            status,
            score,
            source,
            campaign,
            estimated_value as "estimatedValue",
            probability,
            expected_close_date as "expectedCloseDate",
            assigned_to as "assignedTo",
            last_activity_date as "lastActivityDate",
            notes,
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const lead = await crmDB.queryRow<any>(query,
          input.contactId,
          input.status,
          input.score,
          input.source,
          input.campaign,
          input.estimatedValue,
          input.probability,
          input.expectedCloseDate,
          input.assignedTo,
          input.notes
        );

        if (!lead) {
          throw new Error('Failed to create lead');
        }

        return {
          ...lead,
          expectedCloseDate: lead.expectedCloseDate?.toISOString(),
          lastActivityDate: lead.lastActivityDate?.toISOString(),
          createdAt: lead.createdAt.toISOString(),
          updatedAt: lead.updatedAt.toISOString(),
        };
      }),
  }), 
 // Account management
  accounts: router({
    // List accounts
    list: protectedProcedure
      .input(z.object({
        accountType: z.enum(['school', 'district', 'organization', 'individual']).optional(),
        status: z.enum(['active', 'inactive', 'prospect', 'customer']).optional(),
        size: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
        search: z.string().optional(),
      }).merge(PaginationSchema))
      .output(z.object({
        accounts: z.array(AccountSchema),
        total: z.number(),
        hasMore: z.boolean(),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE a.is_active = TRUE";
        const params: any[] = [];
        let paramIndex = 1;

        if (input.accountType) {
          whereClause += ` AND a.account_type = $${paramIndex}`;
          params.push(input.accountType);
          paramIndex++;
        }

        if (input.status) {
          whereClause += ` AND a.status = $${paramIndex}`;
          params.push(input.status);
          paramIndex++;
        }

        if (input.size) {
          whereClause += ` AND a.size = $${paramIndex}`;
          params.push(input.size);
          paramIndex++;
        }

        if (input.search) {
          whereClause += ` AND (a.name ILIKE $${paramIndex} OR a.industry ILIKE $${paramIndex})`;
          params.push(`%${input.search}%`);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM accounts a ${whereClause}`;
        const countResult = await crmDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            a.id,
            a.name,
            a.account_type as "accountType",
            a.industry,
            a.size,
            a.annual_revenue as "annualRevenue",
            a.website,
            a.phone,
            a.email,
            a.address,
            a.city,
            a.state,
            a.country,
            a.postal_code as "postalCode",
            a.primary_contact_id as "primaryContactId",
            a.account_manager_id as "accountManagerId",
            a.status,
            a.tags,
            a.notes,
            a.is_active as "isActive",
            a.created_at as "createdAt",
            a.updated_at as "updatedAt"
          FROM accounts a
          ${whereClause}
          ORDER BY a.name
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const accounts = await crmDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          accounts: accounts.map(account => ({
            ...account,
            createdAt: account.createdAt.toISOString(),
            updatedAt: account.updatedAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Create account
    create: protectedProcedure
      .input(CreateAccountInputSchema)
      .output(AccountSchema)
      .mutation(async ({ input, ctx }) => {
        const query = `
          INSERT INTO accounts (
            name, account_type, industry, size, annual_revenue, website,
            phone, email, address, city, state, country, postal_code,
            primary_contact_id, account_manager_id, status, tags, notes,
            is_active, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, true, NOW(), NOW())
          RETURNING 
            id,
            name,
            account_type as "accountType",
            industry,
            size,
            annual_revenue as "annualRevenue",
            website,
            phone,
            email,
            address,
            city,
            state,
            country,
            postal_code as "postalCode",
            primary_contact_id as "primaryContactId",
            account_manager_id as "accountManagerId",
            status,
            tags,
            notes,
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const account = await crmDB.queryRow<any>(query,
          input.name,
          input.accountType,
          input.industry,
          input.size,
          input.annualRevenue,
          input.website,
          input.phone,
          input.email,
          input.address,
          input.city,
          input.state,
          input.country,
          input.postalCode,
          input.primaryContactId,
          input.accountManagerId,
          input.status,
          input.tags ? JSON.stringify(input.tags) : null,
          input.notes
        );

        if (!account) {
          throw new Error('Failed to create account');
        }

        return {
          ...account,
          createdAt: account.createdAt.toISOString(),
          updatedAt: account.updatedAt.toISOString(),
        };
      }),
  }), 
 // Deal management
  deals: router({
    // List deals
    list: protectedProcedure
      .input(z.object({
        stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
        ownerId: z.number().optional(),
        accountId: z.number().optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
      }).merge(PaginationSchema))
      .output(z.object({
        deals: z.array(DealSchema),
        total: z.number(),
        hasMore: z.boolean(),
        summary: z.object({
          totalValue: z.number(),
          averageValue: z.number(),
          winRate: z.number(),
          totalDeals: z.number(),
        }),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE d.is_active = TRUE";
        const params: any[] = [];
        let paramIndex = 1;

        if (input.stage) {
          whereClause += ` AND d.stage = $${paramIndex}`;
          params.push(input.stage);
          paramIndex++;
        }

        if (input.ownerId) {
          whereClause += ` AND d.owner_id = $${paramIndex}`;
          params.push(input.ownerId);
          paramIndex++;
        }

        if (input.accountId) {
          whereClause += ` AND d.account_id = $${paramIndex}`;
          params.push(input.accountId);
          paramIndex++;
        }

        if (input.minAmount !== undefined) {
          whereClause += ` AND d.amount >= $${paramIndex}`;
          params.push(input.minAmount);
          paramIndex++;
        }

        if (input.maxAmount !== undefined) {
          whereClause += ` AND d.amount <= $${paramIndex}`;
          params.push(input.maxAmount);
          paramIndex++;
        }

        // Get summary statistics
        const summaryQuery = `
          SELECT 
            COUNT(*) as total_deals,
            SUM(amount) as total_value,
            AVG(amount) as average_value,
            COUNT(CASE WHEN stage = 'closed_won' THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN stage IN ('closed_won', 'closed_lost') THEN 1 END), 0) as win_rate
          FROM deals d
          ${whereClause}
        `;

        const summaryResult = await crmDB.queryRow<{
          total_deals: number;
          total_value: number;
          average_value: number;
          win_rate: number;
        }>(summaryQuery, ...params);

        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) as total FROM deals d ${whereClause}`;
        const countResult = await crmDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            d.id,
            d.name,
            d.account_id as "accountId",
            d.contact_id as "contactId",
            d.stage,
            d.amount,
            d.probability,
            d.expected_close_date as "expectedCloseDate",
            d.actual_close_date as "actualCloseDate",
            d.owner_id as "ownerId",
            d.source,
            d.description,
            d.next_step as "nextStep",
            d.is_active as "isActive",
            d.created_at as "createdAt",
            d.updated_at as "updatedAt"
          FROM deals d
          ${whereClause}
          ORDER BY d.amount DESC, d.created_at DESC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const deals = await crmDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          deals: deals.map(deal => ({
            ...deal,
            expectedCloseDate: deal.expectedCloseDate?.toISOString(),
            actualCloseDate: deal.actualCloseDate?.toISOString(),
            createdAt: deal.createdAt.toISOString(),
            updatedAt: deal.updatedAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
          summary: {
            totalValue: summaryResult?.total_value || 0,
            averageValue: summaryResult?.average_value || 0,
            winRate: summaryResult?.win_rate || 0,
            totalDeals: summaryResult?.total_deals || 0,
          },
        };
      }),

    // Create deal
    create: protectedProcedure
      .input(CreateDealInputSchema)
      .output(DealSchema)
      .mutation(async ({ input, ctx }) => {
        const query = `
          INSERT INTO deals (
            name, account_id, contact_id, stage, amount, probability,
            expected_close_date, owner_id, source, description, next_step,
            is_active, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, NOW(), NOW())
          RETURNING 
            id,
            name,
            account_id as "accountId",
            contact_id as "contactId",
            stage,
            amount,
            probability,
            expected_close_date as "expectedCloseDate",
            actual_close_date as "actualCloseDate",
            owner_id as "ownerId",
            source,
            description,
            next_step as "nextStep",
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const deal = await crmDB.queryRow<any>(query,
          input.name,
          input.accountId,
          input.contactId,
          input.stage,
          input.amount,
          input.probability,
          input.expectedCloseDate,
          ctx.user.id, // owner_id
          input.source,
          input.description,
          input.nextStep
        );

        if (!deal) {
          throw new Error('Failed to create deal');
        }

        return {
          ...deal,
          expectedCloseDate: deal.expectedCloseDate?.toISOString(),
          actualCloseDate: deal.actualCloseDate?.toISOString(),
          createdAt: deal.createdAt.toISOString(),
          updatedAt: deal.updatedAt.toISOString(),
        };
      }),
  }), 
 // Campaign management
  campaigns: router({
    // List campaigns
    list: protectedProcedure
      .input(z.object({
        campaignType: z.enum(['email', 'sms', 'social', 'webinar', 'event', 'direct_mail']).optional(),
        status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).optional(),
        ownerId: z.number().optional(),
      }).merge(PaginationSchema))
      .output(z.object({
        campaigns: z.array(CampaignSchema),
        total: z.number(),
        hasMore: z.boolean(),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE c.is_active = TRUE";
        const params: any[] = [];
        let paramIndex = 1;

        if (input.campaignType) {
          whereClause += ` AND c.campaign_type = $${paramIndex}`;
          params.push(input.campaignType);
          paramIndex++;
        }

        if (input.status) {
          whereClause += ` AND c.status = $${paramIndex}`;
          params.push(input.status);
          paramIndex++;
        }

        if (input.ownerId) {
          whereClause += ` AND c.owner_id = $${paramIndex}`;
          params.push(input.ownerId);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM campaigns c ${whereClause}`;
        const countResult = await crmDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            c.id,
            c.name,
            c.campaign_type as "campaignType",
            c.status,
            c.start_date as "startDate",
            c.end_date as "endDate",
            c.budget,
            c.target_audience as "targetAudience",
            c.description,
            c.goals,
            c.owner_id as "ownerId",
            c.metrics,
            c.is_active as "isActive",
            c.created_at as "createdAt",
            c.updated_at as "updatedAt"
          FROM campaigns c
          ${whereClause}
          ORDER BY c.created_at DESC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const campaigns = await crmDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          campaigns: campaigns.map(campaign => ({
            ...campaign,
            startDate: campaign.startDate?.toISOString(),
            endDate: campaign.endDate?.toISOString(),
            createdAt: campaign.createdAt.toISOString(),
            updatedAt: campaign.updatedAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Create campaign
    create: protectedProcedure
      .input(CreateCampaignInputSchema)
      .output(CampaignSchema)
      .mutation(async ({ input, ctx }) => {
        const query = `
          INSERT INTO campaigns (
            name, campaign_type, status, start_date, end_date, budget,
            target_audience, description, goals, owner_id, is_active,
            created_at, updated_at
          )
          VALUES ($1, $2, 'draft', $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW())
          RETURNING 
            id,
            name,
            campaign_type as "campaignType",
            status,
            start_date as "startDate",
            end_date as "endDate",
            budget,
            target_audience as "targetAudience",
            description,
            goals,
            owner_id as "ownerId",
            metrics,
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const campaign = await crmDB.queryRow<any>(query,
          input.name,
          input.campaignType,
          input.startDate,
          input.endDate,
          input.budget,
          input.targetAudience,
          input.description,
          input.goals,
          ctx.user.id
        );

        if (!campaign) {
          throw new Error('Failed to create campaign');
        }

        return {
          ...campaign,
          startDate: campaign.startDate?.toISOString(),
          endDate: campaign.endDate?.toISOString(),
          createdAt: campaign.createdAt.toISOString(),
          updatedAt: campaign.updatedAt.toISOString(),
        };
      }),
  }),

  // Analytics and reporting
  analytics: router({
    // Get CRM dashboard stats
    dashboard: protectedProcedure
      .input(z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      }))
      .output(z.object({
        totalContacts: z.number(),
        totalLeads: z.number(),
        totalDeals: z.number(),
        totalRevenue: z.number(),
        conversionRate: z.number(),
        averageDealSize: z.number(),
        activeCampaigns: z.number(),
        recentActivity: z.array(z.object({
          type: z.string(),
          description: z.string(),
          timestamp: z.string(),
        })),
      }))
      .query(async ({ input, ctx }) => {
        let dateFilter = "";
        const params: any[] = [];
        let paramIndex = 1;

        if (input.startDate) {
          dateFilter += ` AND created_at >= $${paramIndex}`;
          params.push(input.startDate);
          paramIndex++;
        }

        if (input.endDate) {
          dateFilter += ` AND created_at <= $${paramIndex}`;
          params.push(input.endDate);
          paramIndex++;
        }

        // Get dashboard statistics
        const statsQuery = `
          SELECT 
            (SELECT COUNT(*) FROM contacts WHERE is_active = true ${dateFilter}) as total_contacts,
            (SELECT COUNT(*) FROM leads WHERE is_active = true ${dateFilter}) as total_leads,
            (SELECT COUNT(*) FROM deals WHERE is_active = true ${dateFilter}) as total_deals,
            (SELECT COALESCE(SUM(amount), 0) FROM deals WHERE stage = 'closed_won' AND is_active = true ${dateFilter}) as total_revenue,
            (SELECT COALESCE(AVG(amount), 0) FROM deals WHERE stage = 'closed_won' AND is_active = true ${dateFilter}) as average_deal_size,
            (SELECT COUNT(*) FROM campaigns WHERE status = 'active' AND is_active = true) as active_campaigns
        `;

        const stats = await crmDB.queryRow<{
          total_contacts: number;
          total_leads: number;
          total_deals: number;
          total_revenue: number;
          average_deal_size: number;
          active_campaigns: number;
        }>(statsQuery, ...params);

        // Calculate conversion rate
        const conversionRate = stats && stats.total_leads > 0 ? 
          (stats.total_deals / stats.total_leads) * 100 : 0;

        return {
          totalContacts: stats?.total_contacts || 0,
          totalLeads: stats?.total_leads || 0,
          totalDeals: stats?.total_deals || 0,
          totalRevenue: stats?.total_revenue || 0,
          conversionRate,
          averageDealSize: stats?.average_deal_size || 0,
          activeCampaigns: stats?.active_campaigns || 0,
          recentActivity: [], // Placeholder for recent activity
        };
      }),
  }),
});