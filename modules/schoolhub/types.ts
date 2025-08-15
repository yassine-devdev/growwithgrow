
export type SchoolHubSection = 'School' | 'Student' | 'Parent' | 'Teacher' | 'Administration' | 'Finance' | 'Marketing';

// School Hub Data Structures
export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  staff: Staff[];
}

export interface Department {
  id: string;
  name: string;
  courses: Course[];
}

export interface College {
  id: string;
  name: string;
  departments: Department[];
}
