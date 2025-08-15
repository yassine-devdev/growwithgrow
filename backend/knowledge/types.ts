export interface Curriculum {
    id: number;
    name: string;
    description?: string;
    subject: string;
    gradeLevel: string;
    standards?: string[];
    learningObjectives: string[];
    durationWeeks?: number;
    prerequisites?: string[];
    resources?: string[];
    assessmentMethods?: string[];
    createdBy: number;
    schoolId?: number;
    isPublished: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Assessment {
    id: number;
    title: string;
    description?: string;
    assessmentType: 'quiz' | 'test' | 'exam' | 'project' | 'assignment' | 'survey';
    subject: string;
    gradeLevel?: string;
    durationMinutes?: number;
    totalPoints: number;
    passingScore?: number;
    instructions?: string;
    createdBy: number;
    schoolId?: number;
    isPublished: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Question {
    id: number;
    assessmentId?: number;
    questionText: string;
    questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank' | 'matching';
    options?: any;
    correctAnswer?: string;
    points: number;
    explanation?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
    orderIndex: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface LibraryItem {
    id: number;
    title: string;
    description?: string;
    itemType: 'book' | 'article' | 'video' | 'audio' | 'document' | 'image' | 'link';
    contentUrl?: string;
    fileSize?: number;
    durationSeconds?: number;
    author?: string;
    publisher?: string;
    publicationDate?: Date;
    isbn?: string;
    subject?: string;
    gradeLevel?: string;
    language: string;
    tags?: string[];
    accessLevel: 'public' | 'restricted' | 'private';
    downloadCount: number;
    viewCount: number;
    rating?: number;
    createdBy: number;
    schoolId?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface StoreItem {
    id: number;
    title: string;
    description?: string;
    itemType: 'book' | 'course' | 'exam' | 'bundle' | 'subscription';
    price: number;
    currency: string;
    discountPercentage: number;
    category?: string;
    subject?: string;
    gradeLevel?: string;
    author?: string;
    publisher?: string;
    isbn?: string;
    previewUrl?: string;
    contentUrl?: string;
    fileSize?: number;
    durationHours?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    prerequisites?: string[];
    learningOutcomes?: string[];
    tags?: string[];
    rating?: number;
    reviewCount: number;
    purchaseCount: number;
    isFeatured: boolean;
    isAvailable: boolean;
    createdBy: number;
    createdAt: Date;
    updatedAt: Date;
  }
  