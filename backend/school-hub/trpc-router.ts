import { z } from 'zod';
import { router, protectedProcedure, teacherProcedure, adminProcedure } from '../trpc/router';
import { PaginationSchema } from '../shared/types';
import { schoolHubDB } from './db';

// Zod schemas for school-hub operations
const CourseSchema = z.object({
  id: z.number(),
  schoolId: z.number(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  credits: z.number(),
  gradeLevel: z.string().optional(),
  subject: z.string(),
  department: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  syllabusUrl: z.string().url().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateCourseInputSchema = z.object({
  schoolId: z.number(),
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
  description: z.string().optional(),
  credits: z.number().min(0).max(20),
  gradeLevel: z.string().optional(),
  subject: z.string().min(1).max(100),
  department: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  syllabusUrl: z.string().url().optional(),
});

const ClassSchema = z.object({
  id: z.number(),
  courseId: z.number(),
  teacherId: z.number(),
  section: z.string(),
  roomNumber: z.string().optional(),
  schedule: z.any().optional(), // JSON object
  maxStudents: z.number(),
  currentEnrollment: z.number(),
  semester: z.string(),
  academicYear: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateClassInputSchema = z.object({
  courseId: z.number(),
  teacherId: z.number(),
  section: z.string().min(1).max(10),
  roomNumber: z.string().optional(),
  schedule: z.any().optional(),
  maxStudents: z.number().min(1).max(1000),
  semester: z.string().min(1),
  academicYear: z.string().min(1),
});

const AssignmentSchema = z.object({
  id: z.number(),
  classId: z.number(),
  title: z.string(),
  description: z.string().optional(),
  assignmentType: z.enum(['homework', 'quiz', 'exam', 'project', 'essay', 'lab']),
  totalPoints: z.number(),
  dueDate: z.string().optional(),
  instructions: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  isPublished: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateAssignmentInputSchema = z.object({
  classId: z.number(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  assignmentType: z.enum(['homework', 'quiz', 'exam', 'project', 'essay', 'lab']),
  totalPoints: z.number().min(0).max(1000),
  dueDate: z.string().datetime().optional(),
  instructions: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
});

const SubmissionSchema = z.object({
  id: z.number(),
  assignmentId: z.number(),
  studentId: z.number(),
  content: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  submittedAt: z.string(),
  status: z.enum(['draft', 'submitted', 'graded', 'returned']),
  score: z.number().optional(),
  feedback: z.string().optional(),
  gradedAt: z.string().optional(),
  gradedBy: z.number().optional(),
  isLate: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateSubmissionInputSchema = z.object({
  assignmentId: z.number(),
  content: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  status: z.enum(['draft', 'submitted']).default('draft'),
});

const GradeSubmissionInputSchema = z.object({
  submissionId: z.number(),
  score: z.number().min(0),
  feedback: z.string().optional(),
});

const EnrollmentSchema = z.object({
  id: z.number(),
  studentId: z.number(),
  classId: z.number(),
  enrollmentDate: z.string(),
  status: z.enum(['enrolled', 'dropped', 'completed', 'withdrawn']),
  finalGrade: z.string().optional(),
  gradePoints: z.number().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateEnrollmentInputSchema = z.object({
  studentId: z.number(),
  classId: z.number(),
});

// School-hub router implementation
export const schoolHubRouter = router({
  // Course management
  courses: router({
    // List courses with filtering and pagination
    list: protectedProcedure
      .input(z.object({
        schoolId: z.number().optional(),
        subject: z.string().optional(),
        gradeLevel: z.string().optional(),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
      }).merge(PaginationSchema))
      .output(z.object({
        courses: z.array(CourseSchema),
        total: z.number(),
        hasMore: z.boolean(),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE c.is_active = TRUE";
        const params: any[] = [];
        let paramIndex = 1;

        if (input.schoolId) {
          whereClause += ` AND c.school_id = ${paramIndex}`;
          params.push(input.schoolId);
          paramIndex++;
        }

        if (input.subject) {
          whereClause += ` AND c.subject ILIKE ${paramIndex}`;
          params.push(`%${input.subject}%`);
          paramIndex++;
        }

        if (input.gradeLevel) {
          whereClause += ` AND c.grade_level = ${paramIndex}`;
          params.push(input.gradeLevel);
          paramIndex++;
        }

        if (input.search) {
          whereClause += ` AND (c.name ILIKE ${paramIndex} OR c.code ILIKE ${paramIndex} OR c.description ILIKE ${paramIndex})`;
          params.push(`%${input.search}%`);
          paramIndex++;
        }

        if (input.isActive !== undefined) {
          whereClause = whereClause.replace("c.is_active = TRUE", `c.is_active = ${paramIndex}`);
          params.push(input.isActive);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM courses c ${whereClause}`;
        const countResult = await schoolHubDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            c.id,
            c.school_id as "schoolId",
            c.name,
            c.code,
            c.description,
            c.credits,
            c.grade_level as "gradeLevel",
            c.subject,
            c.department,
            c.prerequisites,
            c.syllabus_url as "syllabusUrl",
            c.is_active as "isActive",
            c.created_at as "createdAt",
            c.updated_at as "updatedAt"
          FROM courses c
          ${whereClause}
          ORDER BY c.name
          LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
        `;

        const courses = await schoolHubDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          courses: courses.map(course => ({
            ...course,
            createdAt: course.createdAt.toISOString(),
            updatedAt: course.updatedAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Get course by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .output(CourseSchema)
      .query(async ({ input, ctx }) => {
        const query = `
          SELECT 
            id,
            school_id as "schoolId",
            name,
            code,
            description,
            credits,
            grade_level as "gradeLevel",
            subject,
            department,
            prerequisites,
            syllabus_url as "syllabusUrl",
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM courses
          WHERE id = $1 AND is_active = TRUE
        `;

        const course = await schoolHubDB.queryRow<any>(query, input.id);

        if (!course) {
          throw new Error('Course not found');
        }

        return {
          ...course,
          createdAt: course.createdAt.toISOString(),
          updatedAt: course.updatedAt.toISOString(),
        };
      }),

    // Create course
    create: teacherProcedure
      .input(CreateCourseInputSchema)
      .output(CourseSchema)
      .mutation(async ({ input, ctx }) => {
        const query = `
          INSERT INTO courses (
            school_id, name, code, description, credits, grade_level,
            subject, department, prerequisites, syllabus_url, is_active,
            created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW(), NOW())
          RETURNING 
            id,
            school_id as "schoolId",
            name,
            code,
            description,
            credits,
            grade_level as "gradeLevel",
            subject,
            department,
            prerequisites,
            syllabus_url as "syllabusUrl",
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const course = await schoolHubDB.queryRow<any>(query,
          input.schoolId,
          input.name,
          input.code,
          input.description,
          input.credits,
          input.gradeLevel,
          input.subject,
          input.department,
          input.prerequisites ? JSON.stringify(input.prerequisites) : null,
          input.syllabusUrl
        );

        if (!course) {
          throw new Error('Failed to create course');
        }

        return {
          ...course,
          createdAt: course.createdAt.toISOString(),
          updatedAt: course.updatedAt.toISOString(),
        };
      }),
  }),

  // Class management
  classes: router({
    // List classes
    list: protectedProcedure
      .input(z.object({
        courseId: z.number().optional(),
        teacherId: z.number().optional(),
        semester: z.string().optional(),
        academicYear: z.string().optional(),
      }).merge(PaginationSchema))
      .output(z.object({
        classes: z.array(ClassSchema),
        total: z.number(),
        hasMore: z.boolean(),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE cl.is_active = TRUE";
        const params: any[] = [];
        let paramIndex = 1;

        if (input.courseId) {
          whereClause += ` AND cl.course_id = ${paramIndex}`;
          params.push(input.courseId);
          paramIndex++;
        }

        if (input.teacherId) {
          whereClause += ` AND cl.teacher_id = ${paramIndex}`;
          params.push(input.teacherId);
          paramIndex++;
        }

        if (input.semester) {
          whereClause += ` AND cl.semester = ${paramIndex}`;
          params.push(input.semester);
          paramIndex++;
        }

        if (input.academicYear) {
          whereClause += ` AND cl.academic_year = ${paramIndex}`;
          params.push(input.academicYear);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM classes cl ${whereClause}`;
        const countResult = await schoolHubDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            cl.id,
            cl.course_id as "courseId",
            cl.teacher_id as "teacherId",
            cl.section,
            cl.room_number as "roomNumber",
            cl.schedule,
            cl.max_students as "maxStudents",
            cl.current_enrollment as "currentEnrollment",
            cl.semester,
            cl.academic_year as "academicYear",
            cl.is_active as "isActive",
            cl.created_at as "createdAt",
            cl.updated_at as "updatedAt"
          FROM classes cl
          ${whereClause}
          ORDER BY cl.semester DESC, cl.section
          LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
        `;

        const classes = await schoolHubDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          classes: classes.map(cls => ({
            ...cls,
            createdAt: cls.createdAt.toISOString(),
            updatedAt: cls.updatedAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Create class
    create: teacherProcedure
      .input(CreateClassInputSchema)
      .output(ClassSchema)
      .mutation(async ({ input, ctx }) => {
        const query = `
          INSERT INTO classes (
            course_id, teacher_id, section, room_number, schedule,
            max_students, current_enrollment, semester, academic_year,
            is_active, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8, true, NOW(), NOW())
          RETURNING 
            id,
            course_id as "courseId",
            teacher_id as "teacherId",
            section,
            room_number as "roomNumber",
            schedule,
            max_students as "maxStudents",
            current_enrollment as "currentEnrollment",
            semester,
            academic_year as "academicYear",
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const cls = await schoolHubDB.queryRow<any>(query,
          input.courseId,
          input.teacherId,
          input.section,
          input.roomNumber,
          input.schedule ? JSON.stringify(input.schedule) : null,
          input.maxStudents,
          input.semester,
          input.academicYear
        );

        if (!cls) {
          throw new Error('Failed to create class');
        }

        return {
          ...cls,
          createdAt: cls.createdAt.toISOString(),
          updatedAt: cls.updatedAt.toISOString(),
        };
      }),
  }),

  // Assignment management
  assignments: router({
    // List assignments
    list: protectedProcedure
      .input(z.object({
        classId: z.number().optional(),
        assignmentType: z.enum(['homework', 'quiz', 'exam', 'project', 'essay', 'lab']).optional(),
        isPublished: z.boolean().optional(),
      }).merge(PaginationSchema))
      .output(z.object({
        assignments: z.array(AssignmentSchema),
        total: z.number(),
        hasMore: z.boolean(),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE a.is_active = TRUE";
        const params: any[] = [];
        let paramIndex = 1;

        if (input.classId) {
          whereClause += ` AND a.class_id = ${paramIndex}`;
          params.push(input.classId);
          paramIndex++;
        }

        if (input.assignmentType) {
          whereClause += ` AND a.assignment_type = ${paramIndex}`;
          params.push(input.assignmentType);
          paramIndex++;
        }

        if (input.isPublished !== undefined) {
          whereClause += ` AND a.is_published = ${paramIndex}`;
          params.push(input.isPublished);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM assignments a ${whereClause}`;
        const countResult = await schoolHubDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            a.id,
            a.class_id as "classId",
            a.title,
            a.description,
            a.assignment_type as "assignmentType",
            a.total_points as "totalPoints",
            a.due_date as "dueDate",
            a.instructions,
            a.attachments,
            a.is_published as "isPublished",
            a.is_active as "isActive",
            a.created_at as "createdAt",
            a.updated_at as "updatedAt"
          FROM assignments a
          ${whereClause}
          ORDER BY a.due_date DESC NULLS LAST, a.created_at DESC
          LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
        `;

        const assignments = await schoolHubDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          assignments: assignments.map(assignment => ({
            ...assignment,
            dueDate: assignment.dueDate?.toISOString(),
            createdAt: assignment.createdAt.toISOString(),
            updatedAt: assignment.updatedAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Create assignment
    create: teacherProcedure
      .input(CreateAssignmentInputSchema)
      .output(AssignmentSchema)
      .mutation(async ({ input, ctx }) => {
        const query = `
          INSERT INTO assignments (
            class_id, title, description, assignment_type, total_points,
            due_date, instructions, attachments, is_published, is_active,
            created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW())
          RETURNING 
            id,
            class_id as "classId",
            title,
            description,
            assignment_type as "assignmentType",
            total_points as "totalPoints",
            due_date as "dueDate",
            instructions,
            attachments,
            is_published as "isPublished",
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const assignment = await schoolHubDB.queryRow<any>(query,
          input.classId,
          input.title,
          input.description,
          input.assignmentType,
          input.totalPoints,
          input.dueDate,
          input.instructions,
          input.attachments ? JSON.stringify(input.attachments) : null,
          input.isPublished
        );

        if (!assignment) {
          throw new Error('Failed to create assignment');
        }

        return {
          ...assignment,
          dueDate: assignment.dueDate?.toISOString(),
          createdAt: assignment.createdAt.toISOString(),
          updatedAt: assignment.updatedAt.toISOString(),
        };
      }),
  }),

  // Submission management
  submissions: router({
    // List submissions
    list: protectedProcedure
      .input(z.object({
        assignmentId: z.number().optional(),
        studentId: z.number().optional(),
        status: z.enum(['draft', 'submitted', 'graded', 'returned']).optional(),
      }).merge(PaginationSchema))
      .output(z.object({
        submissions: z.array(SubmissionSchema),
        total: z.number(),
        hasMore: z.boolean(),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE 1=1";
        const params: any[] = [];
        let paramIndex = 1;

        if (input.assignmentId) {
          whereClause += ` AND s.assignment_id = ${paramIndex}`;
          params.push(input.assignmentId);
          paramIndex++;
        }

        if (input.studentId) {
          whereClause += ` AND s.student_id = ${paramIndex}`;
          params.push(input.studentId);
          paramIndex++;
        }

        if (input.status) {
          whereClause += ` AND s.status = ${paramIndex}`;
          params.push(input.status);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM submissions s ${whereClause}`;
        const countResult = await schoolHubDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            s.id,
            s.assignment_id as "assignmentId",
            s.student_id as "studentId",
            s.content,
            s.attachments,
            s.submitted_at as "submittedAt",
            s.status,
            s.score,
            s.feedback,
            s.graded_at as "gradedAt",
            s.graded_by as "gradedBy",
            s.is_late as "isLate",
            s.created_at as "createdAt",
            s.updated_at as "updatedAt"
          FROM submissions s
          ${whereClause}
          ORDER BY s.submitted_at DESC
          LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
        `;

        const submissions = await schoolHubDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          submissions: submissions.map(submission => ({
            ...submission,
            submittedAt: submission.submittedAt.toISOString(),
            gradedAt: submission.gradedAt?.toISOString(),
            createdAt: submission.createdAt.toISOString(),
            updatedAt: submission.updatedAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Create submission
    create: protectedProcedure
      .input(CreateSubmissionInputSchema)
      .output(SubmissionSchema)
      .mutation(async ({ input, ctx }) => {
        // Check if assignment exists and get due date
        const assignmentQuery = `SELECT due_date FROM assignments WHERE id = $1 AND is_active = true`;
        const assignment = await schoolHubDB.queryRow<{ due_date: Date }>(assignmentQuery, input.assignmentId);
        
        if (!assignment) {
          throw new Error('Assignment not found');
        }

        const now = new Date();
        const isLate = assignment.due_date ? now > assignment.due_date : false;

        const query = `
          INSERT INTO submissions (
            assignment_id, student_id, content, attachments, submitted_at,
            status, is_late, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, NOW(), $5, $6, NOW(), NOW())
          RETURNING 
            id,
            assignment_id as "assignmentId",
            student_id as "studentId",
            content,
            attachments,
            submitted_at as "submittedAt",
            status,
            score,
            feedback,
            graded_at as "gradedAt",
            graded_by as "gradedBy",
            is_late as "isLate",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const submission = await schoolHubDB.queryRow<any>(query,
          input.assignmentId,
          ctx.user.id,
          input.content,
          input.attachments ? JSON.stringify(input.attachments) : null,
          input.status,
          isLate
        );

        if (!submission) {
          throw new Error('Failed to create submission');
        }

        return {
          ...submission,
          submittedAt: submission.submittedAt.toISOString(),
          gradedAt: submission.gradedAt?.toISOString(),
          createdAt: submission.createdAt.toISOString(),
          updatedAt: submission.updatedAt.toISOString(),
        };
      }),

    // Grade submission
    grade: teacherProcedure
      .input(GradeSubmissionInputSchema)
      .output(SubmissionSchema)
      .mutation(async ({ input, ctx }) => {
        const query = `
          UPDATE submissions 
          SET 
            score = $1,
            feedback = $2,
            status = 'graded',
            graded_at = NOW(),
            graded_by = $3,
            updated_at = NOW()
          WHERE id = $4
          RETURNING 
            id,
            assignment_id as "assignmentId",
            student_id as "studentId",
            content,
            attachments,
            submitted_at as "submittedAt",
            status,
            score,
            feedback,
            graded_at as "gradedAt",
            graded_by as "gradedBy",
            is_late as "isLate",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const submission = await schoolHubDB.queryRow<any>(query,
          input.score,
          input.feedback,
          ctx.user.id,
          input.submissionId
        );

        if (!submission) {
          throw new Error('Submission not found or grading failed');
        }

        return {
          ...submission,
          submittedAt: submission.submittedAt.toISOString(),
          gradedAt: submission.gradedAt?.toISOString(),
          createdAt: submission.createdAt.toISOString(),
          updatedAt: submission.updatedAt.toISOString(),
        };
      }),
  }),

  // Enrollment management
  enrollments: router({
    // List enrollments
    list: protectedProcedure
      .input(z.object({
        studentId: z.number().optional(),
        classId: z.number().optional(),
        status: z.enum(['enrolled', 'dropped', 'completed', 'withdrawn']).optional(),
      }).merge(PaginationSchema))
      .output(z.object({
        enrollments: z.array(EnrollmentSchema),
        total: z.number(),
        hasMore: z.boolean(),
      }))
      .query(async ({ input, ctx }) => {
        let whereClause = "WHERE e.is_active = TRUE";
        const params: any[] = [];
        let paramIndex = 1;

        if (input.studentId) {
          whereClause += ` AND e.student_id = ${paramIndex}`;
          params.push(input.studentId);
          paramIndex++;
        }

        if (input.classId) {
          whereClause += ` AND e.class_id = ${paramIndex}`;
          params.push(input.classId);
          paramIndex++;
        }

        if (input.status) {
          whereClause += ` AND e.status = ${paramIndex}`;
          params.push(input.status);
          paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM enrollments e ${whereClause}`;
        const countResult = await schoolHubDB.queryRow<{ total: number }>(countQuery, ...params);
        const total = countResult?.total || 0;

        // Get paginated data
        const dataQuery = `
          SELECT 
            e.id,
            e.student_id as "studentId",
            e.class_id as "classId",
            e.enrollment_date as "enrollmentDate",
            e.status,
            e.final_grade as "finalGrade",
            e.grade_points as "gradePoints",
            e.is_active as "isActive",
            e.created_at as "createdAt",
            e.updated_at as "updatedAt"
          FROM enrollments e
          ${whereClause}
          ORDER BY e.enrollment_date DESC
          LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
        `;

        const enrollments = await schoolHubDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

        return {
          enrollments: enrollments.map(enrollment => ({
            ...enrollment,
            enrollmentDate: enrollment.enrollmentDate.toISOString(),
            createdAt: enrollment.createdAt.toISOString(),
            updatedAt: enrollment.updatedAt.toISOString(),
          })),
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Create enrollment
    create: protectedProcedure
      .input(CreateEnrollmentInputSchema)
      .output(EnrollmentSchema)
      .mutation(async ({ input, ctx }) => {
        // Check if class has capacity
        const classQuery = `SELECT max_students, current_enrollment FROM classes WHERE id = $1 AND is_active = true`;
        const classInfo = await schoolHubDB.queryRow<{ max_students: number; current_enrollment: number }>(classQuery, input.classId);
        
        if (!classInfo) {
          throw new Error('Class not found');
        }

        if (classInfo.current_enrollment >= classInfo.max_students) {
          throw new Error('Class is at maximum capacity');
        }

        // Create enrollment
        const query = `
          INSERT INTO enrollments (
            student_id, class_id, enrollment_date, status, is_active,
            created_at, updated_at
          )
          VALUES ($1, $2, NOW(), 'enrolled', true, NOW(), NOW())
          RETURNING 
            id,
            student_id as "studentId",
            class_id as "classId",
            enrollment_date as "enrollmentDate",
            status,
            final_grade as "finalGrade",
            grade_points as "gradePoints",
            is_active as "isActive",
            created_at as "createdAt",
            updated_at as "updatedAt"
        `;

        const enrollment = await schoolHubDB.queryRow<any>(query, input.studentId, input.classId);

        if (!enrollment) {
          throw new Error('Failed to create enrollment');
        }

        // Update class enrollment count
        await schoolHubDB.exec(
          `UPDATE classes SET current_enrollment = current_enrollment + 1, updated_at = NOW() WHERE id = $1`,
          input.classId
        );

        return {
          ...enrollment,
          enrollmentDate: enrollment.enrollmentDate.toISOString(),
          createdAt: enrollment.createdAt.toISOString(),
          updatedAt: enrollment.updatedAt.toISOString(),
        };
      }),
  }),
});