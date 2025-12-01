import YAML from 'yaml';
import raw from 'raw.macro';

import leaderboardMetrics from './routerMetrics/leaderboard.json';
import categoryScores from './routerMetrics/category_scores.json';
import contactInfoData from './contactInfo.json';
import datasetInfoData from './datasetInfo.json';
import { Router, DatasetInfo, ContactInfo } from '../types';

const roundToOneDecimal = (value: number): number => Math.round(value * 10) / 10;
const roundNullableToOneDecimal = (value: number | null): number | null =>
  value === null ? null : roundToOneDecimal(value);

export const contactInfo: ContactInfo = contactInfoData as ContactInfo;
export const datasetInfo: DatasetInfo = datasetInfoData as DatasetInfo;

const calculateAverageScore = (metrics: {
  arenaScore: number;
  optimalSelectionScore: number | null;
  optimalCostScore: number | null;
  optimalAccScore: number | null;
  robustnessScore: number | null;
  latencyScore: number | null;
}): number => {
  const scores: number[] = [metrics.arenaScore];
  if (metrics.optimalSelectionScore !== null) scores.push(metrics.optimalSelectionScore);
  if (metrics.optimalCostScore !== null) scores.push(metrics.optimalCostScore);
  if (metrics.optimalAccScore !== null) scores.push(metrics.optimalAccScore);
  if (metrics.robustnessScore !== null) scores.push(metrics.robustnessScore);
  if (metrics.latencyScore !== null) scores.push(metrics.latencyScore);
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

type LeaderboardMetricRecord = {
  'Router Name': string;
  'Arena Score': number;
  'Optimal Selection Score': number | null;
  'Optimal Cost Score': number | null;
  'Optimal Acc. Score': number | null;
  'Robustness Score': number | null;
  'Latency Score': number | null;
  Accuracy: number;
  'Cost per 1k': number;
};

type RouterMetadataEntry = {
  name: string;
  type: 'open-source' | 'closed-source';
  description: string;
  affiliation: string;
  modelPool: string[];
  paperUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  huggingfaceUrl?: string;
};

const routersYaml = raw('./routers.yaml');
const routerMetadata: Record<string, RouterMetadataEntry> = YAML.parse(routersYaml);
const rawRouterData: LeaderboardMetricRecord[] = leaderboardMetrics;

export const routerCategoryScores = categoryScores;

const routersWithRanks = rawRouterData.map(router => {
  const id = router['Router Name'].toLowerCase().replace(/[_\s]/g, '-');
  const metadata = routerMetadata[router['Router Name']] || {
    name: router['Router Name'],
    type: 'open-source' as const,
    description: `Router: ${router['Router Name']}`,
    affiliation: 'Unknown',
    modelPool: [],
  };

  const metrics = {
    arenaScore: roundToOneDecimal(router['Arena Score']),
    optimalSelectionScore: roundNullableToOneDecimal(router['Optimal Selection Score']),
    optimalCostScore: roundNullableToOneDecimal(router['Optimal Cost Score']),
    optimalAccScore: roundNullableToOneDecimal(router['Optimal Acc. Score']),
    robustnessScore: roundNullableToOneDecimal(router['Robustness Score']),
    latencyScore: roundNullableToOneDecimal(router['Latency Score']),
    accuracy: router['Accuracy'],
    costPer1k: router['Cost per 1k'],
    overallRank: 0,
  };

  return {
    id,
    ...metadata,
    metrics,
    _averageScore: calculateAverageScore(metrics),
  };
});

routersWithRanks.sort((a, b) => b._averageScore - a._averageScore);
routersWithRanks.forEach((router, index) => {
  router.metrics.overallRank = index + 1;
});

export const routers: Router[] = routersWithRanks.map(({ _averageScore, ...router }) => router);
