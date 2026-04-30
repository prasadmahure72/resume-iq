export interface AnalysisResult {
  overall_score: number;
  ats_score: number;
  sections: SectionFeedback[];
  keyword_gaps: KeywordGap[];
  strengths: string[];
  critical_issues: string[];
  suggestions: Suggestion[];
  rewrite_examples: RewriteExample[];
  verdict: string;
}

export interface SectionFeedback {
  name: 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications';
  score: number;
  feedback: string;
  improvements: string[];
}

export interface KeywordGap {
  keyword: string;
  importance: 'critical' | 'important' | 'nice-to-have';
  context: string;
}

export interface Suggestion {
  priority: 'high' | 'medium' | 'low';
  category: string;
  action: string;
  reason: string;
}

export interface RewriteExample {
  original: string;
  improved: string;
  section: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  resume_filename: string;
  resume_storage_path: string | null;
  job_title: string | null;
  company_name: string | null;
  job_description: string;
  resume_text: string;
  overall_score: number;
  result: AnalysisResult;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  analyses_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}
