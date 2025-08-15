export interface Achievement {
    id: number;
    name: string;
    description?: string;
    iconUrl?: string;
    category: string;
    points: number;
    badgeColor: string;
    criteria: any;
    isActive: boolean;
    schoolId?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface UserAchievement {
    id: number;
    userId: number;
    achievementId: number;
    earnedAt: Date;
    progress?: any;
  }
  
  export interface Leaderboard {
    id: number;
    name: string;
    description?: string;
    metricType: 'points' | 'achievements' | 'assignments' | 'attendance' | 'custom';
    timePeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
    schoolId?: number;
    classId?: number;
    gradeLevel?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface UserPoints {
    id: number;
    userId: number;
    points: number;
    reason?: string;
    category?: string;
    referenceId?: number;
    referenceType?: string;
    schoolId?: number;
    awardedAt: Date;
  }
  
  export interface Quest {
    id: number;
    name: string;
    description?: string;
    instructions?: string;
    questType: 'daily' | 'weekly' | 'monthly' | 'special' | 'story';
    difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
    pointsReward: number;
    requirements: any;
    startDate?: Date;
    endDate?: Date;
    maxParticipants?: number;
    currentParticipants: number;
    schoolId?: number;
    classId?: number;
    gradeLevel?: string;
    isActive: boolean;
    createdBy: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface LeaderboardEntry {
    userId: number;
    userName: string;
    userAvatar?: string;
    score: number;
    rank: number;
  }
  