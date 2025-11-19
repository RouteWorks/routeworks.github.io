import { Router, DatasetInfo, ContactInfo } from '../types';

const roundToOneDecimal = (value: number): number => Math.round(value * 10) / 10;
const roundNullableToOneDecimal = (value: number | null): number | null =>
  value === null ? null : roundToOneDecimal(value);

export const contactInfo: ContactInfo = {
  authors: [
    {
      name: 'Yifan Lu',
      email: 'yifan.lu@rice.edu',
      affiliation: 'Rice University',
    },
    {
      name: 'Rixin Liu',
      email: 'rixin.liu@rice.edu',
      affiliation: 'Rice University',
    },
    {
      name: 'Jiayi Yuan',
      email: 'jy101@rice.edu',
      affiliation: 'Rice University',
    },
    {
      name: 'Xingqi Cui',
      email: 'xc66@rice.edu',
      affiliation: 'Rice University',
    },
    {
      name: 'Shenrun Zhang',
      email: 'sz81@rice.edu',
      affiliation: 'Rice University',
    },
    {
      name: 'Hongyi Liu',
      email: 'hl87@rice.edu',
      affiliation: 'Rice University',
    },
    {
      name: 'Jiarong Xing',
      email: 'jxing@rice.edu',
      affiliation: 'Rice University',
    },
  ],
  institution: 'Rice University',
  email: 'yifan.lu@rice.edu',
  github: 'https://github.com/RouteWorks/RouterArena',
  paper: 'https://www.arxiv.org/abs/2510.00202',
};

export const datasetInfo: DatasetInfo = {
  totalQueries: 8400,
  domains: 9,
  categories: 44,
  difficultyLevels: ['Easy', 'Medium', 'Hard'],
  sources: ['23 source datasets'],
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

const rawRouterData = [
  {
    "Router Name": "RouterDC",
    "Arena Score": 33.75,
    "Optimal Selection Score": 39.84,
    "Optimal Cost Score": 72.998,
    "Optimal Acc. Score": 49.05,
    "Robustness Score": 97.6,
    "Latency Score": 10.7527,
    "Accuracy": 32.01,
    "Cost per 1k": 0.07
  },
  {
    "Router Name": "azure",
    "Arena Score": 66.66,
    "Optimal Selection Score": 22.52,
    "Optimal Cost Score": 46.322,
    "Optimal Acc. Score": 81.96,
    "Robustness Score": null,
    "Latency Score": null,
    "Accuracy": 68.09,
    "Cost per 1k": 0.54
  },
  {
    "Router Name": "carrot",
    "Arena Score": 63.87,
    "Optimal Selection Score": 2.68,
    "Optimal Cost Score": 6.7697,
    "Optimal Acc. Score": 78.63,
    "Robustness Score": 93.6,
    "Latency Score": 1.4993,
    "Accuracy": 67.21,
    "Cost per 1k": 2.06
  },
  {
    "Router Name": "gpt5",
    "Arena Score": 64.32,
    "Optimal Selection Score": null,
    "Optimal Cost Score": null,
    "Optimal Acc. Score": null,
    "Robustness Score": null,
    "Latency Score": null,
    "Accuracy": 73.96,
    "Cost per 1k": 10.02
  },
  {
    "Router Name": "graphrouter",
    "Arena Score": 57.22,
    "Optimal Selection Score": 4.73,
    "Optimal Cost Score": 38.3347,
    "Optimal Acc. Score": 74.25,
    "Robustness Score": 97.5,
    "Latency Score": 2.6954,
    "Accuracy": 57.00,
    "Cost per 1k": 0.34
  },
  {
    "Router Name": "mirt_bert",
    "Arena Score": 66.89,
    "Optimal Selection Score": 3.44,
    "Optimal Cost Score": 19.6178,
    "Optimal Acc. Score": 78.18,
    "Robustness Score": 94.5,
    "Latency Score": 27.027,
    "Accuracy": 66.88,
    "Cost per 1k": 0.15
  },
  {
    "Router Name": "nirt_bert",
    "Arena Score": 66.12,
    "Optimal Selection Score": 3.83,
    "Optimal Cost Score": 14.039,
    "Optimal Acc. Score": 77.88,
    "Robustness Score": 44.5,
    "Latency Score": 10.4167,
    "Accuracy": 66.34,
    "Cost per 1k": 0.21
  },
  {
    "Router Name": "notdiamond",
    "Arena Score": 63.0,
    "Optimal Selection Score": 1.55,
    "Optimal Cost Score": 2.1367,
    "Optimal Acc. Score": 76.81,
    "Robustness Score": null,
    "Latency Score": null,
    "Accuracy": 60.83,
    "Cost per 1k": 4.10
  },
  {
    "Router Name": "routellm",
    "Arena Score": 48.07,
    "Optimal Selection Score": 99.72,
    "Optimal Cost Score": 99.6314,
    "Optimal Acc. Score": 68.76,
    "Robustness Score": 99.8,
    "Latency Score": 0.4016,
    "Accuracy": 47.04,
    "Cost per 1k": 0.27
  },
  {
    "Router Name": "routerbench_knn",
    "Arena Score": 55.48,
    "Optimal Selection Score": 13.09,
    "Optimal Cost Score": 25.4887,
    "Optimal Acc. Score": 78.77,
    "Robustness Score": 51.3,
    "Latency Score": 1.328,
    "Accuracy": 58.69,
    "Cost per 1k": 4.27
  },
  {
    "Router Name": "routerbench_mlp",
    "Arena Score": 57.56,
    "Optimal Selection Score": 13.39,
    "Optimal Cost Score": 24.4499,
    "Optimal Acc. Score": 83.32,
    "Robustness Score": 96.9,
    "Latency Score": 90.9091,
    "Accuracy": 61.62,
    "Cost per 1k": 4.83
  },
  {
    "Router Name": "vllm",
    "Arena Score": 64.32,
    "Optimal Selection Score": 4.79,
    "Optimal Cost Score": 12.5426,
    "Optimal Acc. Score": 79.33,
    "Robustness Score": 100.0,
    "Latency Score": 0.1863,
    "Accuracy": 67.28,
    "Cost per 1k": 1.67
  },
  {
    "Router Name": "chayan",
    "Arena Score": 63.83,
    "Optimal Selection Score": 43.03,
    "Optimal Cost Score": 43.75,
    "Optimal Acc. Score": 88.74,
    "Robustness Score": null,
    "Latency Score": null,
    "Accuracy": 64.89,
    "Cost per 1k": 0.56
  }
];

// Router metadata mapping
const routerMetadata: Record<
  string,
  {
    name: string;
    type: 'open-source' | 'closed-source';
    description: string;
    affiliation: string;
    modelPool: string[];
    paperUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
    huggingfaceUrl?: string;
  }
> = {
  RouterDC: {
    name: 'RouterDC',
    type: 'open-source',
    description: 'Dual contrastive learning-based router with cost optimization',
    affiliation: 'SUSTech',
    modelPool: ['GPT-3.5', 'Claude-2', 'Gemini-Pro', 'Llama-2-13B'],
    paperUrl: 'https://arxiv.org/abs/2409.19886',
    websiteUrl: 'https://arxiv.org/abs/2409.19886',
    githubUrl: 'https://github.com/shuhao02/RouterDC',
  },
  azure: {
    name: 'Azure-Router',
    type: 'closed-source',
    description: "Microsoft Azure's model routing service",
    affiliation: 'Microsoft',
    modelPool: ['GPT-4', 'GPT-3.5', 'GPT-4-Turbo'],
    paperUrl: 'https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/model-router',
    websiteUrl: 'https://ai.azure.com/catalog/models/model-router',
    githubUrl: undefined,
  },
  carrot: {
    name: 'CARROT',
    type: 'open-source',
    description: 'Cost-aware routing with dual contrastive learning approach',
    affiliation: 'UMich',
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B'],
    paperUrl: 'https://arxiv.org/abs/2502.03261',
    websiteUrl: 'https://arxiv.org/abs/2502.03261',
    githubUrl: 'https://github.com/somerstep/CARROT',
    huggingfaceUrl: 'https://huggingface.co/CARROT-LLM-Routing',
  },
  gpt5: {
    name: 'GPT-5',
    type: 'closed-source',
    description: "OpenAI's internal routing system for GPT model family",
    affiliation: 'OpenAI',
    modelPool: ['GPT-5', 'GPT-4', 'GPT-3.5'],
    paperUrl: 'https://openai.com/index/introducing-gpt-5/',
    websiteUrl: 'https://openai.com/index/introducing-gpt-5/',
    githubUrl: undefined,
  },
  graphrouter: {
    name: 'GraphRouter',
    type: 'open-source',
    description: 'Graph neural network-based routing with semantic understanding',
    affiliation: 'UIUC',
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B', 'Mixtral-8x7B'],
    paperUrl: 'https://arxiv.org/abs/2410.03834',
    websiteUrl: 'https://arxiv.org/abs/2410.03834',
    githubUrl: 'https://github.com/ulab-uiuc/GraphRouter',
  },
  mirt_bert: {
    name: 'MIRT-BERT',
    type: 'open-source',
    description: 'Multi-item response theory with BERT embeddings',
    affiliation: 'USTC',
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B'],
    paperUrl: 'https://arxiv.org/pdf/2506.01048',
    websiteUrl: 'https://arxiv.org/pdf/2506.01048',
    githubUrl: 'https://github.com/Mercidaiha/IRT-Router',
  },
  nirt_bert: {
    name: 'NIRT-BERT',
    type: 'open-source',
    description: 'Neural item response theory with BERT-based routing',
    affiliation: 'USTC',
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B'],
    paperUrl: 'https://arxiv.org/pdf/2506.01048',
    websiteUrl: 'https://arxiv.org/pdf/2506.01048',
    githubUrl: 'https://github.com/Mercidaiha/IRT-Router',
  },
  notdiamond: {
    name: 'NotDiamond',
    type: 'closed-source',
    description: 'Closed-source routing service with access to 60+ models',
    affiliation: 'NotDiamond',
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B', 'Mixtral-8x7B', 'Qwen-72B'],
    paperUrl: 'https://www.notdiamond.ai/',
    websiteUrl: 'https://www.notdiamond.ai/',
    githubUrl: undefined,
  },
  routellm: {
    name: 'RouteLLM',
    type: 'open-source',
    description: 'Binary selection between strong and weak models',
    affiliation: 'Berkeley',
    modelPool: ['GPT-4', 'GPT-3.5'],
    paperUrl: 'https://arxiv.org/abs/2406.18665',
    websiteUrl: 'https://arxiv.org/abs/2406.18665',
    githubUrl: 'https://github.com/lm-sys/RouteLLM',
    huggingfaceUrl: 'https://huggingface.co/routellm',
  },
  routerbench_knn: {
    name: 'RouterBench-KNN',
    type: 'open-source',
    description: 'K-Nearest Neighbors-based router benchmark',
    affiliation: 'Martian',
    modelPool: ['GPT-4', 'GPT-3.5', 'Claude-3'],
    paperUrl: 'https://arxiv.org/pdf/2403.12031',
    websiteUrl: 'https://arxiv.org/pdf/2403.12031',
    githubUrl: 'https://github.com/withmartian/routerbench',
    huggingfaceUrl: 'https://huggingface.co/datasets/withmartian/routerbench',
  },
  routerbench_mlp: {
    name: 'RouterBench-MLP',
    type: 'open-source',
    description: 'Multi-Layer Perceptron-based router benchmark',
    affiliation: 'Martian',
    modelPool: ['GPT-4', 'GPT-3.5', 'Claude-3'],
    paperUrl: 'https://arxiv.org/pdf/2403.12031',
    websiteUrl: 'https://arxiv.org/pdf/2403.12031',
    githubUrl: 'https://github.com/withmartian/routerbench',
    huggingfaceUrl: 'https://huggingface.co/datasets/withmartian/routerbench',
  },
  vllm: {
    name: 'vLLM-SR',
    type: 'open-source',
    description: 'vLLM-based routing service',
    affiliation: 'vLLM SR Team',
    modelPool: ['GPT-4', 'GPT-3.5'],
    paperUrl: 'https://vllm-semantic-router.com/',
    websiteUrl: 'https://vllm-semantic-router.com/',
    githubUrl: 'https://github.com/vllm-project/semantic-router',
    huggingfaceUrl: 'https://huggingface.co/llm-semantic-router',
  },
  chayan: {
    name: 'Chayan',
    type: 'open-source',
    description: 'Chayan-based routing service',
    affiliation: 'Adaptive Classifier',
    modelPool: ['GPT-4', 'GPT-3.5'],
    paperUrl: 'https://huggingface.co/adaptive-classifier/chayan',
    websiteUrl: 'https://huggingface.co/adaptive-classifier/chayan',
    githubUrl: undefined,
    huggingfaceUrl: 'https://huggingface.co/adaptive-classifier/chayan',
  }
};

// Convert raw data to Router format and calculate overall ranks
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
    accuracy: roundToOneDecimal(router['Accuracy']),
    costPer1k: roundToOneDecimal(router['Cost per 1k']),
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
