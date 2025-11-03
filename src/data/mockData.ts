import { Router, DatasetInfo, ContactInfo } from '../types';

export const contactInfo: ContactInfo = {
  authors: [
    { name: 'Yifan Lu', email: 'yifan.lu@rice.edu', affiliation: 'Rice University' },
    { name: 'Rixin Liu', email: 'rixin.liu@rice.edu', affiliation: 'Rice University' },
    { name: 'Jiayi Yuan', email: 'jy101@rice.edu', affiliation: 'Rice University' },
    { name: 'Xingqi Cui', email: 'xc66@rice.edu', affiliation: 'Rice University' },
    { name: 'Shenrun Zhang', email: 'sz81@rice.edu', affiliation: 'Rice University' },
    { name: 'Hongyi Liu', email: 'hl87@rice.edu', affiliation: 'Rice University' },
    { name: 'Jiarong Xing', email: 'jxing@rice.edu', affiliation: 'Rice University' }
  ],
  institution: 'Rice University',
  email: 'yifan.lu@rice.edu',
  github: 'https://github.com/RouteWorks/RouterArena',
  paper: 'https://www.arxiv.org/abs/2510.00202'
};

export const datasetInfo: DatasetInfo = {
  totalQueries: 8400,
  domains: 9,
  categories: 44,
  difficultyLevels: ['Easy', 'Medium', 'Hard'],
  sources: ['23 source datasets']
};

// Helper function to calculate average of all available metrics
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

// Raw router data from the provided JSON
const rawRouterData = [
  {
    "Router Name": "RouterDC",
    "Arena Score": 0.3375,
    "Optimal Selection Score": 0.3984,
    "Optimal Cost Score": 0.72998,
    "Optimal Acc. Score": 0.4905,
    "Robustness Score": 0.976,
    "Latency Score": 0.107527
  },
  {
    "Router Name": "azure",
    "Arena Score": 0.6666,
    "Optimal Selection Score": 0.2252,
    "Optimal Cost Score": 0.46322,
    "Optimal Acc. Score": 0.8196,
    "Robustness Score": null,
    "Latency Score": null
  },
  {
    "Router Name": "carrot",
    "Arena Score": 0.6387,
    "Optimal Selection Score": 0.0268,
    "Optimal Cost Score": 0.067697,
    "Optimal Acc. Score": 0.7863,
    "Robustness Score": 0.936,
    "Latency Score": 0.014993
  },
  {
    "Router Name": "gpt5",
    "Arena Score": 0.6432,
    "Optimal Selection Score": null,
    "Optimal Cost Score": null,
    "Optimal Acc. Score": null,
    "Robustness Score": null,
    "Latency Score": null
  },
  {
    "Router Name": "graphrouter",
    "Arena Score": 0.5722,
    "Optimal Selection Score": 0.0473,
    "Optimal Cost Score": 0.383347,
    "Optimal Acc. Score": 0.7425,
    "Robustness Score": 0.975,
    "Latency Score": 0.026954
  },
  {
    "Router Name": "mirt_bert",
    "Arena Score": 0.6689,
    "Optimal Selection Score": 0.0344,
    "Optimal Cost Score": 0.196178,
    "Optimal Acc. Score": 0.7818,
    "Robustness Score": 0.945,
    "Latency Score": 0.27027
  },
  {
    "Router Name": "nirt_bert",
    "Arena Score": 0.6612,
    "Optimal Selection Score": 0.0383,
    "Optimal Cost Score": 0.14039,
    "Optimal Acc. Score": 0.7788,
    "Robustness Score": 0.445,
    "Latency Score": 0.104167
  },
  {
    "Router Name": "notdiamond",
    "Arena Score": 0.63,
    "Optimal Selection Score": 0.0155,
    "Optimal Cost Score": 0.021367,
    "Optimal Acc. Score": 0.7681,
    "Robustness Score": null,
    "Latency Score": null
  },
  {
    "Router Name": "routellm",
    "Arena Score": 0.4807,
    "Optimal Selection Score": 0.9972,
    "Optimal Cost Score": 0.996314,
    "Optimal Acc. Score": 0.6876,
    "Robustness Score": 0.998,
    "Latency Score": 0.004016
  },
  {
    "Router Name": "routerbench_knn",
    "Arena Score": 0.5548,
    "Optimal Selection Score": 0.1309,
    "Optimal Cost Score": 0.254887,
    "Optimal Acc. Score": 0.7877,
    "Robustness Score": 0.513,
    "Latency Score": 0.01328
  },
  {
    "Router Name": "routerbench_mlp",
    "Arena Score": 0.5756,
    "Optimal Selection Score": 0.1339,
    "Optimal Cost Score": 0.244499,
    "Optimal Acc. Score": 0.8332,
    "Robustness Score": 0.969,
    "Latency Score": 0.909091
  },
  {
    "Router Name": "vllm",
    "Arena Score": 0.6432,
    "Optimal Selection Score": 0.0479,
    "Optimal Cost Score": 0.125426,
    "Optimal Acc. Score": 0.7933,
    "Robustness Score": 1.0,
    "Latency Score": 0.001863
  }
];

// Router metadata mapping
const routerMetadata: Record<string, { name: string; type: 'academic' | 'commercial'; description: string; affiliation: string; modelPool: string[]; paperUrl?: string; githubUrl?: string }> = {
  'RouterDC': {
    name: 'RouterDC',
    type: 'academic',
    description: 'Dual contrastive learning-based router with cost optimization',
    affiliation: 'SUSTech',
    modelPool: ['GPT-3.5', 'Claude-2', 'Gemini-Pro', 'Llama-2-13B'],
    paperUrl: 'https://arxiv.org/abs/2024.xxxxx',
    githubUrl: 'https://github.com/example/routerdc'
  },
  'azure': {
    name: 'Azure',
    type: 'commercial',
    description: 'Microsoft Azure\'s model routing service',
    affiliation: 'Microsoft',
    modelPool: ['GPT-4', 'GPT-3.5', 'GPT-4-Turbo'],
    paperUrl: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service',
    githubUrl: undefined
  },
  'carrot': {
    name: 'CARROT',
    type: 'academic',
    description: 'Cost-aware routing with dual contrastive learning approach',
    affiliation: 'UMich',
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B'],
    paperUrl: 'https://arxiv.org/abs/2024.xxxxx',
    githubUrl: 'https://github.com/example/carrot'
  },
  'gpt5': {
    name: 'GPT-5',
    type: 'commercial',
    description: 'OpenAI\'s internal routing system for GPT model family',
    affiliation: 'OpenAI',
    modelPool: ['GPT-5', 'GPT-4', 'GPT-3.5'],
    paperUrl: 'https://openai.com/research/gpt-5',
    githubUrl: undefined
  },
  'graphrouter': {
    name: 'GraphRouter',
    type: 'academic',
    description: 'Graph neural network-based routing with semantic understanding',
    affiliation: 'UIUC',
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B', 'Mixtral-8x7B'],
    paperUrl: 'https://arxiv.org/abs/2024.xxxxx',
    githubUrl: 'https://github.com/example/graphrouter'
  },
  'mirt_bert': {
    name: 'MIRT-BERT',
    type: 'academic',
    description: 'Multi-item response theory with BERT embeddings',
    affiliation: 'USTC',
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B'],
    paperUrl: 'https://arxiv.org/abs/2024.xxxxx',
    githubUrl: 'https://github.com/example/mirt-bert'
  },
  'nirt_bert': {
    name: 'NIRT-BERT',
    type: 'academic',
    description: 'Neural item response theory with BERT-based routing',
    affiliation: 'USTC',
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B'],
    paperUrl: 'https://arxiv.org/abs/2024.xxxxx',
    githubUrl: 'https://github.com/example/nirt-bert'
  },
  'notdiamond': {
    name: 'NotDiamond',
    type: 'commercial',
    description: 'Commercial routing service with access to 60+ models',
    affiliation: 'NotDiamond',
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B', 'Mixtral-8x7B', 'Qwen-72B'],
    paperUrl: 'https://notdiamond.ai',
    githubUrl: undefined
  },
  'routellm': {
    name: 'RouteLLM',
    type: 'academic',
    description: 'Binary selection between strong and weak models',
    affiliation: 'Berkeley',
    modelPool: ['GPT-4', 'GPT-3.5'],
    paperUrl: 'https://arxiv.org/abs/2024.xxxxx',
    githubUrl: 'https://github.com/example/routellm'
  },
  'routerbench_knn': {
    name: 'KNN',
    type: 'academic',
    description: 'K-Nearest Neighbors-based router benchmark',
    affiliation: 'Academic',
    modelPool: ['GPT-4', 'GPT-3.5', 'Claude-3'],
    paperUrl: 'https://arxiv.org/abs/2024.xxxxx',
    githubUrl: 'https://github.com/example/routerbench-knn'
  },
  'routerbench_mlp': {
    name: 'MLP',
    type: 'academic',
    description: 'Multi-Layer Perceptron-based router benchmark',
    affiliation: 'Academic',
    modelPool: ['GPT-4', 'GPT-3.5', 'Claude-3'],
    paperUrl: 'https://arxiv.org/abs/2024.xxxxx',
    githubUrl: 'https://github.com/example/routerbench-mlp'
  },
  'vllm': {
    name: 'vLLM-SR',
    type: 'commercial',
    description: 'vLLM-based routing service',
    affiliation: 'vLLM',
    modelPool: ['GPT-4', 'GPT-3.5'],
    paperUrl: 'https://vllm.ai',
    githubUrl: undefined
  }
};

// Convert raw data to Router format and calculate overall ranks
const routersWithRanks = rawRouterData.map((router) => {
  const id = router["Router Name"].toLowerCase().replace(/[_\s]/g, '-');
  const metadata = routerMetadata[router["Router Name"]] || {
    name: router["Router Name"],
    type: 'academic' as const,
    description: `Router: ${router["Router Name"]}`,
    affiliation: 'Unknown',
    modelPool: [],
  };

  const metrics = {
    arenaScore: router["Arena Score"],
    optimalSelectionScore: router["Optimal Selection Score"],
    optimalCostScore: router["Optimal Cost Score"],
    optimalAccScore: router["Optimal Acc. Score"],
    robustnessScore: router["Robustness Score"],
    latencyScore: router["Latency Score"],
    overallRank: 0, // Will be calculated below
  };

  return {
    id,
    ...metadata,
    metrics,
    _averageScore: calculateAverageScore(metrics), // Temporary field for sorting
  };
});

// Sort by average score and assign ranks
routersWithRanks.sort((a, b) => b._averageScore - a._averageScore);
routersWithRanks.forEach((router, index) => {
  router.metrics.overallRank = index + 1;
});

// Remove temporary averageScore field and export as Router[]
export const routers: Router[] = routersWithRanks.map(({ _averageScore, ...router }) => router);
