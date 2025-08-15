export interface Course {
    id: number;
    schoolId: number;
    name: string;
    code: string;
    description?: string;
    credits: number;
    gradeLevel?: string;
    subject: string;
    department?: string;
    prerequisites?: string[];
    syllabusUrl?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Class {
    id: number;
    courseId: number;
    teacherId: number;
    section: string;
    roomNumber?: string;
    schedule?: any; // JSON object
    maxStudents: number;
    currentEnrollment: number;
    semester: string;
    academicYear: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Enrollment {
    id: number;
    studentId: number;
    classId: number;
    enrollmentDate: Date;
    status: 'enrolled' | 'dropped' | 'completed' | 'withdrawn';
    finalGrade?: string;
    gradePoints?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Assignment {
    id: number;
    classId: number;
    title: string;
    description?: string;
    assignmentType: 'homework' | 'quiz' | 'exam' | 'project' | 'essay' | 'lab';
    totalPoints: number;
    dueDate?: Date;
    instructions?: string;
    attachments?: string[];
    isPublished: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Submission {
    id: number;
    assignmentId: number;
    studentId: number;
    content?: string;
    attachments?: string[];
    submittedAt: Date;
    status: 'draft' | 'submitted' | 'graded' | 'returned';
    score?: number;
    feedback?: string;
    gradedAt?: Date;
    gradedBy?: number;
    isLate: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  