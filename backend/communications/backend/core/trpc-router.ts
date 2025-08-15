import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../../../../trpc/router';
import { PaginationSchema, UserRole } from '../../../../shared/types';
import { coreDB } from './db';

// Zod schemas for core operations
const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: UserRole,
  avatarUrl: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateUserInputSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: UserRole,
  avatarUrl: z.string().url().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

const UpdateUserInputSchema = z.object({
  id: z.number(),
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  role: UserRole.optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  isActive: z.boolean().optional(),
});

const ListUsersInputSchema = z.object({
  role: UserRole.optional(),
  schoolId: z.number().optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
}).merge(PaginationSchema);

const SchoolSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  establishedYear: z.number().optional(),
  schoolType: z.enum(['public', 'private', 'charter', 'international']),
  gradeLevels: z.array(z.string()),
  studentCapacity: z.number().optional(),
  currentEnrollment: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateSchoolInputSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  postalCode: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  establishedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  schoolType: z.enum(['public', 'private', 'charter', 'international']),
  gradeLevels: z.array(z.string()).min(1),
  studentCapacity: z.number().positive().optional(),
});

const UserSchoolSchema = z.object({
  id: z.number(),
  userId: z.number(),
  schoolId: z.number(),
  roleInSchool: z.enum(['admin', 'teacher', 'student', 'parent']),
  gradeLevel: z.string().optional(),
  classSection: z.string().optional(),
  subjectSpecialization: z.array(z.string()).optional(),
  isActive: z.boolean(),
  joinedAt: z.string(),
});

// Core router implementation
export const coreRouter = router({
  // User management
  users: router({
    // List users with filtering and pagination
    list: protectedProcedure
      .input(ListUsersInputSchema)
      .output(z.object({
        users: z.array(UserSchema),
        total: z.number(),
        hasMore: z.boolean(),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE u.is_active = TRUE";
        const params: any[] = [];
        let paramIndex = 1;

        if (input.role) {
          whereClause += ` AND u.role = $${paramIndex}`;
          params.push(input.role);
          paramIndex++;
        }

        if (input.schoolId) {
          whereClause += ` AND EXISTS (
            SELECT 1 FROM user_schools us 
            WHERE us.user_id = u.id AND us.school_id = $${paramIndex} AND us.is_active = TRUE
          )`;
          params.push(input.schoolId);
          paramIndex++;
        }

        if (input.search) {
          whereClause += ` AND (
            u.first_name ILIKE $${paramIndex} OR 
            u.last_name ILIKE $${paramIndex} OR 
            u.email ILIKE $${paramIndex}
          )`;
          params.push(`%${input.search}%`);
          paramIndex++;
        }

        if (input.isActive !== undefined) {
          whereClause = whereClause.replace("u.is_active = TRUE", `u.is_active = $${paramIndex}`);
          params.push(input.isActive);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
        const countResult = await coreDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            u.id,
            u.email,
            u.first_name as "firstName",
            u.last_name as "lastName",
            u.role,
            u.avatar_url as "avatarUrl",
            u.phone,
            u.date_of_birth as "dateOfBirth",
            u.address,
            u.city,
            u.state,
            u.country,
            u.postal_code as "postalCode",
            u.is_active as "isActive",
            u.created_at as "createdAt",
            u.updated_at as "updatedAt"
          FROM users u
          ${whereClause}
          ORDER BY u.created_at DESC
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const users = await coreDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          users: users.map(user => ({
            ...user,
            dateOfBirth: user.dateOfBirth?.toISOString(),
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Get user by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .output(UserSchema)
      .query(async ({ input, ctx }) => {
        const query = `
          SELECT 
            id,
            email,
            first_name as "firstName",
            last_name as "lastName",
            role,
            avatar_url as "avatarUrl",
            phone,
            date_of_birth as "dateOfBirth",
            address,
            city,
            state,
            country,
            postal_code as "postalCode",
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM users
          WHERE id = $1 AND is_active = TRUE
        `;

        const user = await coreDB.queryRow<any>(query, input.id);

        if (!user) {
          throw new Error('User not found');
        }

        return {
          ...user,
          dateOfBirth: user.dateOfBirth?.toISOString(),
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      }),

    // Create user
    create: adminProcedure
      .input(CreateUserInputSchema)
      .output(UserSchema)
      .mutation(async ({ input, ctx }) => {
        const query = `
          INSERT INTO users (
            email, first_name, last_name, role, avatar_url, phone, 
            date_of_birth, address, city, state, country, postal_code,
            is_active, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, NOW(), NOW())
          RETURNING 
            id,
            email,
            first_name as "firstName",
            last_name as "lastName",
            role,
            avatar_url as "avatarUrl",
            phone,
            date_of_birth as "dateOfBirth",
            address,
            city,
            state,
            country,
            postal_code as "postalCode",
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const user = await coreDB.queryRow<any>(query,
          input.email,
          input.firstName,
          input.lastName,
          input.role,
          input.avatarUrl,
          input.phone,
          input.dateOfBirth,
          input.address,
          input.city,
          input.state,
          input.country,
          input.postalCode
        );

        if (!user) {
          throw new Error('Failed to create user');
        }

        return {
          ...user,
          dateOfBirth: user.dateOfBirth?.toISOString(),
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      }),

    // Update user
    update: protectedProcedure
      .input(UpdateUserInputSchema)
      .output(UserSchema)
      .mutation(async ({ input, ctx }) => {
        // Check if user can update this record
        if (ctx.user.role !== 'admin' && ctx.user.id !== input.id) {
          throw new Error('Unauthorized to update this user');
        }

        const updateFields: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        // Build dynamic update query
        Object.entries(input).forEach(([key, value]) => {
          if (key !== 'id' && value !== undefined) {
            const dbField = key === 'firstName' ? 'first_name' :
                           key === 'lastName' ? 'last_name' :
                           key === 'avatarUrl' ? 'avatar_url' :
                           key === 'dateOfBirth' ? 'date_of_birth' :
                           key === 'postalCode' ? 'postal_code' :
                           key === 'isActive' ? 'is_active' : key;
            
            updateFields.push(`${dbField} = $${paramIndex}`);
            params.push(value);
            paramIndex++;
          }
        });

        if (updateFields.length === 0) {
          throw new Error('No fields to update');
        }

        updateFields.push(`updated_at = NOW()`);
        params.push(input.id);

        const query = `
          UPDATE users 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING 
            id,
            email,
            first_name as "firstName",
            last_name as "lastName",
            role,
            avatar_url as "avatarUrl",
            phone,
            date_of_birth as "dateOfBirth",
            address,
            city,
            state,
            country,
            postal_code as "postalCode",
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const user = await coreDB.queryRow<any>(query, ...params);

        if (!user) {
          throw new Error('User not found or update failed');
        }

        return {
          ...user,
          dateOfBirth: user.dateOfBirth?.toISOString(),
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      }),

    // Delete user (soft delete)
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .output(z.object({ success: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const query = `
          UPDATE users 
          SET is_active = false, updated_at = NOW()
          WHERE id = $1
        `;

        await coreDB.exec(query, input.id);

        return { success: true };
      }),
  }),

  // School management
  schools: router({
    // List schools
    list: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        schoolType: z.enum(['public', 'private', 'charter', 'international']).optional(),
        isActive: z.boolean().optional(),
      }).merge(PaginationSchema))
      .output(z.object({
        schools: z.array(SchoolSchema),
        total: z.number(),
        hasMore: z.boolean(),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE is_active = TRUE";
        const params: any[] = [];
        let paramIndex = 1;

        if (input.search) {
          whereClause += ` AND (name ILIKE $${paramIndex} OR city ILIKE $${paramIndex})`;
          params.push(`%${input.search}%`);
          paramIndex++;
        }

        if (input.schoolType) {
          whereClause += ` AND school_type = $${paramIndex}`;
          params.push(input.schoolType);
          paramIndex++;
        }

        if (input.isActive !== undefined) {
          whereClause = whereClause.replace("is_active = TRUE", `is_active = $${paramIndex}`);
          params.push(input.isActive);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM schools ${whereClause}`;
        const countResult = await coreDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            id,
            name,
            description,
            address,
            city,
            state,
            country,
            postal_code as "postalCode",
            phone,
            email,
            website,
            logo_url as "logoUrl",
            established_year as "establishedYear",
            school_type as "schoolType",
            grade_levels as "gradeLevels",
            student_capacity as "studentCapacity",
            current_enrollment as "currentEnrollment",
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM schools
          ${whereClause}
          ORDER BY name
          LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const schools = await coreDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          schools: schools.map(school => ({
            ...school,
            createdAt: school.createdAt.toISOString(),
            updatedAt: school.updatedAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Get school by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .output(SchoolSchema)
      .query(async ({ input, ctx }) => {
        const query = `
          SELECT 
            id,
            name,
            description,
            address,
            city,
            state,
            country,
            postal_code as "postalCode",
            phone,
            email,
            website,
            logo_url as "logoUrl",
            established_year as "establishedYear",
            school_type as "schoolType",
            grade_levels as "gradeLevels",
            student_capacity as "studentCapacity",
            current_enrollment as "currentEnrollment",
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM schools
          WHERE id = $1 AND is_active = TRUE
        `;

        const school = await coreDB.queryRow<any>(query, input.id);

        if (!school) {
          throw new Error('School not found');
        }

        return {
          ...school,
          createdAt: school.createdAt.toISOString(),
          updatedAt: school.updatedAt.toISOString(),
        };
      }),

    // Create school
    create: adminProcedure
      .input(CreateSchoolInputSchema)
      .output(SchoolSchema)
      .mutation(async ({ input, ctx }) => {
        const query = `
          INSERT INTO schools (
            name, description, address, city, state, country, postal_code,
            phone, email, website, logo_url, established_year, school_type,
            grade_levels, student_capacity, current_enrollment, is_active,
            created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 0, true, NOW(), NOW())
          RETURNING 
            id,
            name,
            description,
            address,
            city,
            state,
            country,
            postal_code as "postalCode",
            phone,
            email,
            website,
            logo_url as "logoUrl",
            established_year as "establishedYear",
            school_type as "schoolType",
            grade_levels as "gradeLevels",
            student_capacity as "studentCapacity",
            current_enrollment as "currentEnrollment",
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const school = await coreDB.queryRow<any>(query,
          input.name,
          input.description,
          input.address,
          input.city,
          input.state,
          input.country,
          input.postalCode,
          input.phone,
          input.email,
          input.website,
          input.logoUrl,
          input.establishedYear,
          input.schoolType,
          JSON.stringify(input.gradeLevels),
          input.studentCapacity
        );

        if (!school) {
          throw new Error('Failed to create school');
        }

        return {
          ...school,
          createdAt: school.createdAt.toISOString(),
          updatedAt: school.updatedAt.toISOString(),
        };
      }),
  }),

  // User-School relationships
  userSchools: router({
    // Get user's schools
    getUserSchools: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .output(z.array(UserSchoolSchema))
      .query(async ({ input, ctx }) => {
        const query = `
          SELECT 
            id,
            user_id as "userId",
            school_id as "schoolId",
            role_in_school as "roleInSchool",
            grade_level as "gradeLevel",
            class_section as "classSection",
            subject_specialization as "subjectSpecialization",
            is_active as "isActive",
            joined_at as "joinedAt"
          FROM user_schools
          WHERE user_id = $1 AND is_active = TRUE
          ORDER BY joined_at DESC
        `;

        const userSchools = await coreDB.queryAll<any>(query, input.userId);

        return userSchools.map(us => ({
          ...us,
          joinedAt: us.joinedAt.toISOString(),
        }));
      }),

    // Add user to school
    addUserToSchool: adminProcedure
      .input(z.object({
        userId: z.number(),
        schoolId: z.number(),
        roleInSchool: z.enum(['admin', 'teacher', 'student', 'parent']),
        gradeLevel: z.string().optional(),
        classSection: z.string().optional(),
        subjectSpecialization: z.array(z.string()).optional(),
      }))
      .output(UserSchoolSchema)
      .mutation(async ({ input, ctx }) => {
        const query = `
          INSERT INTO user_schools (
            user_id, school_id, role_in_school, grade_level, 
            class_section, subject_specialization, is_active, joined_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
          RETURNING 
            id,
            user_id as "userId",
            school_id as "schoolId",
            role_in_school as "roleInSchool",
            grade_level as "gradeLevel",
            class_section as "classSection",
            subject_specialization as "subjectSpecialization",
            is_active as "isActive",
            joined_at as "joinedAt"
        `;

        const userSchool = await coreDB.queryRow<any>(query,
          input.userId,
          input.schoolId,
          input.roleInSchool,
          input.gradeLevel,
          input.classSection,
          input.subjectSpecialization ? JSON.stringify(input.subjectSpecialization) : null
        );

        if (!userSchool) {
          throw new Error('Failed to add user to school');
        }

        return {
          ...userSchool,
          joinedAt: userSchool.joinedAt.toISOString(),
        };
      }),
  }),
});