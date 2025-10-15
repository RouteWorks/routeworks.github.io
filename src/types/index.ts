export interface Router {
  id: string;
  name: string;
  type: 'academic' | 'commercial';
  description: string;
  metrics: {
    arenaScore: number;
    costRatioScore: number;
    optimalAccScore: number;
    latencyScore: number;
    robustnessScore: number;
    overallRank: number;
  };
  modelPool: string[];
  paperUrl?: string;
  githubUrl?: string;
}

export interface DatasetInfo {
  totalQueries: number;
  domains: number;
  categories: number;
  difficultyLevels: string[];
  sources: string[];
}

export interface EvaluationMetric {
  name: string;
  description: string;
  value: number;
  unit?: string;
  higherIsBetter: boolean;
}

export interface Author {
  name: string;
  email: string;
  affiliation: string;
}

export interface ContactInfo {
  authors: Author[];
  institution: string;
  email: string;
  github: string;
  paper: string;
}
