export interface CVData {
  fileName: string;
  content: string;
  uploadDate: Date;
}

export interface UserPreferences {
  targetPosition: string;
  age: number;
  highestDegree: string;
  hasOngoingDegree: boolean;
  ongoingDegree?: string;
  experienceYears: number;
  industry: string;
  [key: string]: unknown;
}

export interface AnalysisResult {
  atsCompatibility: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  skillMatch: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    recommendations: string[];
  };
  experienceMatch: {
    score: number;
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  };
  overallScore: number;
  improvementAreas: {
    priority: 'high' | 'medium' | 'low';
    area: string;
    description: string;
    actionItems: string[];
  }[];
}

export type AppStep = 'upload' | 'preferences' | 'analysis' | 'results';