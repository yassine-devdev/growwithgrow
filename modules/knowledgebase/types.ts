
export type KnowledgeBaseCurriculumSection = "Browse" | "Standards Alignment" | "Version History";
export type KnowledgeBaseAssessmentsL3Section = 'Create New' | 'Question Bank' | 'View Results' | 'Generative Assessments (AI)' | 'Adaptive Testing Engine' | 'Integrity Shield (AI)';
export type KnowledgeBaseInstitutionalDataSection = "Data Sources" | "Reports" | "Dashboard";
export type KnowledgeBaseResourceLibrarySection = "Documents" | "Videos" | "Links";
export type KnowledgeBaseAISearchSection = "Search Interface" | "Analytics" | "Settings";
// Updated L2 sections
export type KnowledgeBaseSection = 'Curriculum' | 'Assessments' | 'Library' | 'AI Search' | 'Store';

// New L3 for Store
export type KnowledgeBaseStoreSection = 'Books' | 'Courses' | 'Exams';

// New L4 for Store
export type KnowledgeBaseBooksL4Section = 'Search' | 'Filter' | 'Categories' | 'View Details';
export type KnowledgeBaseCoursesL4Section = 'Search' | 'Filter' | 'View Syllabus' | 'Enroll';
export type KnowledgeBaseExamsL4Section = 'Practice Tests' | 'Timed Exams' | 'Results' | 'Difficulty';
export type KnowledgeBaseStoreL4Section = KnowledgeBaseBooksL4Section | KnowledgeBaseCoursesL4Section | KnowledgeBaseExamsL4Section;
