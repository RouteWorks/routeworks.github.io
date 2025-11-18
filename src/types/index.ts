export interface Router {
  id: string;
  name: string;
  type: 'open-source' | 'closed-source';
  description: string;
  affiliation: string;
  metrics: {
    arenaScore: number;
    optimalSelectionScore: number | null;
    optimalCostScore: number | null;
    optimalAccScore: number | null;
    robustnessScore: number | null;
    latencyScore: number | null;
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
