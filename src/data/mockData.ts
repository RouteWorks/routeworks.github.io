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
  email: 'jxing@rice.edu',
  github: 'https://github.com/RouteWorks',
  paper: 'https://www.arxiv.org/abs/2510.00202'
};

export const datasetInfo: DatasetInfo = {
  totalQueries: 8400,
  domains: 9,
  categories: 44,
  difficultyLevels: ['Easy', 'Medium', 'Hard'],
  sources: ['23 source datasets']
};

export const routers: Router[] = [
  {
    id: 'carrot',
    name: 'CARROT',
    type: 'academic',
    description: 'Cost-aware routing with dual contrastive learning approach',
    metrics: {
      arenaScore: 0.85,
      costRatioScore: 0.92,
      optimalAccScore: 0.78,
      latencyScore: 0.88,
      robustnessScore: 0.82,
      overallRank: 1
    },
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B'],
    paperUrl: 'https://arxiv.org/abs/2024.xxxxx',
    githubUrl: 'https://github.com/example/carrot'
  },
  {
    id: 'routerdc',
    name: 'RouterDC',
    type: 'academic',
    description: 'Dual contrastive learning-based router with cost optimization',
    metrics: {
      arenaScore: 0.82,
      costRatioScore: 0.95,
      optimalAccScore: 0.75,
      latencyScore: 0.85,
      robustnessScore: 0.80,
      overallRank: 2
    },
    modelPool: ['GPT-3.5', 'Claude-2', 'Gemini-Pro', 'Llama-2-13B'],
    paperUrl: 'https://arxiv.org/abs/2024.xxxxx',
    githubUrl: 'https://github.com/example/routerdc'
  },
  {
    id: 'graphrouter',
    name: 'GraphRouter',
    type: 'academic',
    description: 'Graph neural network-based routing with semantic understanding',
    metrics: {
      arenaScore: 0.80,
      costRatioScore: 0.88,
      optimalAccScore: 0.82,
      latencyScore: 0.90,
      robustnessScore: 0.85,
      overallRank: 3
    },
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B', 'Mixtral-8x7B'],
    paperUrl: 'https://arxiv.org/abs/2024.xxxxx',
    githubUrl: 'https://github.com/example/graphrouter'
  },
  {
    id: 'mirt-bert',
    name: 'MIRT-BERT',
    type: 'academic',
    description: 'Multi-item response theory with BERT embeddings',
    metrics: {
      arenaScore: 0.78,
      costRatioScore: 0.75,
      optimalAccScore: 0.88,
      latencyScore: 0.82,
      robustnessScore: 0.78,
      overallRank: 4
    },
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B'],
    paperUrl: 'https://arxiv.org/abs/2024.xxxxx',
    githubUrl: 'https://github.com/example/mirt-bert'
  },
  {
    id: 'nirt-bert',
    name: 'NIRT-BERT',
    type: 'academic',
    description: 'Neural item response theory with BERT-based routing',
    metrics: {
      arenaScore: 0.76,
      costRatioScore: 0.70,
      optimalAccScore: 0.85,
      latencyScore: 0.80,
      robustnessScore: 0.75,
      overallRank: 5
    },
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B'],
    paperUrl: 'https://arxiv.org/abs/2024.xxxxx',
    githubUrl: 'https://github.com/example/nirt-bert'
  },
  {
    id: 'routellm',
    name: 'RouteLLM',
    type: 'academic',
    description: 'Binary selection between strong and weak models',
    metrics: {
      arenaScore: 0.74,
      costRatioScore: 0.85,
      optimalAccScore: 0.80,
      latencyScore: 0.75,
      robustnessScore: 0.82,
      overallRank: 6
    },
    modelPool: ['GPT-4', 'GPT-3.5'],
    paperUrl: 'https://arxiv.org/abs/2024.xxxxx',
    githubUrl: 'https://github.com/example/routellm'
  },
  {
    id: 'gpt-5',
    name: 'GPT-5',
    type: 'commercial',
    description: 'OpenAI\'s internal routing system for GPT model family',
    metrics: {
      arenaScore: 0.88,
      costRatioScore: 0.60,
      optimalAccScore: 0.90,
      latencyScore: 0.85,
      robustnessScore: 0.88,
      overallRank: 7
    },
    modelPool: ['GPT-5', 'GPT-4', 'GPT-3.5'],
    paperUrl: 'https://openai.com/research/gpt-5',
    githubUrl: undefined
  },
  {
    id: 'notdiamond',
    name: 'NotDiamond',
    type: 'commercial',
    description: 'Commercial routing service with access to 60+ models',
    metrics: {
      arenaScore: 0.82,
      costRatioScore: 0.65,
      optimalAccScore: 0.85,
      latencyScore: 0.80,
      robustnessScore: 0.83,
      overallRank: 8
    },
    modelPool: ['GPT-4', 'Claude-3', 'Gemini-Pro', 'Llama-2-70B', 'Mixtral-8x7B', 'Qwen-72B'],
    paperUrl: 'https://notdiamond.ai',
    githubUrl: undefined
  },
  {
    id: 'azure-router',
    name: 'Azure Model Router',
    type: 'commercial',
    description: 'Microsoft Azure\'s model routing service',
    metrics: {
      arenaScore: 0.80,
      costRatioScore: 0.70,
      optimalAccScore: 0.82,
      latencyScore: 0.88,
      robustnessScore: 0.80,
      overallRank: 9
    },
    modelPool: ['GPT-4', 'GPT-3.5', 'GPT-4-Turbo'],
    paperUrl: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service',
    githubUrl: undefined
  }
];
