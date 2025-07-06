// Unified type definitions for all sheet types

// Base topic interface that all sheets share
export interface BaseTopic {
  id: string;
  step_no: number;
  difficulty?: number;
  post_link?: string;
  yt_link?: string;
  editorial_link?: string;
  lc_link?: string;
  plus_link?: string;
  ques_topic?: string;
}

// A2Z Sheet specific topic structure
export interface A2ZTopic extends BaseTopic {
  sub_step_no: number;
  sl_no: number;
  step_title: string;
  sub_step_title: string;
  question_title: string;
}

// Other sheets (Blind75, SDE, Striver79) topic structure
export interface GeneralTopic extends BaseTopic {
  sl_no_in_step: number;
  head_step_no: string;
  title: string;
  cs_link?: string;
  gfg_link?: string;
  company_tags?: string;
}

// Unified topic interface for UI
export interface UnifiedTopic {
  id: string;
  step_no: number;
  sub_step_no?: number;
  sl_no: number;
  step_title: string;
  sub_step_title: string;
  question_title: string;
  post_link?: string;
  yt_link?: string;
  editorial_link?: string;
  lc_link?: string;
  plus_link?: string;
  cs_link?: string;
  gfg_link?: string;
  difficulty?: number;
  ques_topic?: string;
  company_tags?: string;
}

// A2Z Sheet structure
export interface A2ZSubStep {
  sub_step_no: number;
  sub_step_title: string;
  topics: A2ZTopic[];
}

export interface A2ZStep {
  step_no: number;
  step_title: string;
  sub_steps: A2ZSubStep[];
}

export type A2ZSheet = A2ZStep[];

// General sheet structure (Blind75, SDE, Striver79)
export interface GeneralStep {
  step_no: number;
  head_step_no: string;
  topics: GeneralTopic[];
}

export interface GeneralSheet {
  sheetData: GeneralStep[];
}

// Unified step interface for UI
export interface UnifiedSubStep {
  sub_step_no: number;
  sub_step_title: string;
  topics: UnifiedTopic[];
}

export interface UnifiedStep {
  step_no: number;
  step_title: string;
  sub_steps: UnifiedSubStep[];
}

export type UnifiedSheet = UnifiedStep[];

// Sheet configuration
export interface SheetConfig {
  id: string;
  name: string;
  fileName: string;
  description: string;
  totalProblems?: number;
}

export const SHEET_CONFIGS: SheetConfig[] = [
  {
    id: 'a2z',
    name: 'A2Z DSA Course',
    fileName: 'a2z_sheet_data.json',
    description: 'Complete A to Z DSA course by Striver with 400+ problems',
  },
  {
    id: 'sde',
    name: 'SDE Sheet',
    fileName: 'sde_sheet_data.json',
    description: 'Top coding interview problems for SDE roles',
  },
  {
    id: 'blind75',
    name: 'Blind 75',
    fileName: 'blind_75_data.json',
    description: 'Must-solve 75 problems for coding interviews',
  },
  {
    id: 'striver79',
    name: 'Striver 79',
    fileName: 'striver_79_data.json',
    description: 'Curated 79 problems by Striver for interview prep',
  },
];

// Filter types
export type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';
export type RevisionFilter = 'all' | 'revision' | 'completed' | 'pending';
