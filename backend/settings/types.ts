export interface SystemSetting {
    id: number;
    key: string;
    value?: string;
    valueType: 'string' | 'number' | 'boolean' | 'json';
    description?: string;
    category: string;
    isPublic: boolean;
    isEditable: boolean;
    schoolId?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface UserSetting {
    id: number;
    userId: number;
    key: string;
    value?: string;
    valueType: 'string' | 'number' | 'boolean' | 'json';
    createdAt: Date;
    updatedAt: Date;
  }
  