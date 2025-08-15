export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'teacher' | 'student' | 'parent' | 'provider';
    avatarUrl?: string;
    phone?: string;
    dateOfBirth?: Date;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface School {
    id: number;
    name: string;
    description?: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
    establishedYear?: number;
    schoolType: 'public' | 'private' | 'charter' | 'international';
    gradeLevels: string[];
    studentCapacity?: number;
    currentEnrollment: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface UserSchool {
    id: number;
    userId: number;
    schoolId: number;
    roleInSchool: 'admin' | 'teacher' | 'student' | 'parent';
    gradeLevel?: string;
    classSection?: string;
    subjectSpecialization?: string[];
    isActive: boolean;
    joinedAt: Date;
  }
  