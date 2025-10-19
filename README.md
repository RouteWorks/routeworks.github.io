
# Project Overview

RouterArena is the first open platform enabling comprehensive evaluation and comparison of LLM routers. The platform features:

- **Principled Dataset**: 8,400 queries across 9 domains and 44 categories using Dewey Decimal Classification and Bloom's taxonomy
- **Multi-Dimensional Metrics**: Arena Score, Cost Ratio, Optimality, Latency, and Robustness evaluation
- **Automated Framework**: Support for both academic and commercial routers with real-time leaderboard updates
- **Fair Comparison**: Unified evaluation protocol for transparent and reproducible results

## Research Team

**Rice University**

- Yifan Lu (yifan.lu@rice.edu)
- Rixin Liu (rixin.liu@rice.edu)
- Jiayi Yuan (jy101@rice.edu)
- Xingqi Cui (xc66@rice.edu)
- Shenrun Zhang (sz81@rice.edu)
- Hongyi Liu (hl87@rice.edu)
- Jiarong Xing (jxing@rice.edu)

## Website Features

### 🏠 Home Page
- Project overview and key features
- Dataset statistics and difficulty levels
- Contact information and collaboration details
- Interactive leaderboard preview

### 🏆 Leaderboard Page
- Comprehensive router rankings across multiple metrics
- Search and filter functionality
- Detailed performance metrics for each router
- Links to papers and source code

### 📝 Submit Page
- Router submission form for evaluation
- Clear guidelines for academic and commercial routers
- Evaluation process explanation
- Contact information for collaboration

### ℹ️ About Page
- Detailed project methodology
- Research team information
- Citation information
- Contact and collaboration details

## Technology Stack

- **Frontend**: React 19.2.0 with TypeScript
- **Routing**: React Router DOM 6.8.1
- **Icons**: Lucide React 0.263.1
- **Charts**: Recharts 2.8.0
- **Styling**: CSS3 with modern features
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rice-university/routerarena.git
cd routerarena
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   └── Header.css      # Header styles
├── pages/              # Page components
│   ├── HomePage.tsx    # Landing page
│   ├── LeaderboardPage.tsx  # Router rankings
│   ├── SubmitPromptPage.tsx # Router submission
│   ├── AboutPage.tsx   # Project information
│   └── *.css          # Page-specific styles
├── data/               # Mock data and constants
│   └── mockData.ts     # Router data and contact info
├── types/              # TypeScript type definitions
│   └── index.ts        # Router and data types
├── assets/             # Static assets
│   └── images/         # Figures from research paper
├── App.tsx             # Main application component
├── App.css             # Global styles
└── index.tsx           # Application entry point
```

## Key Components

### Router Data Structure
```typescript
interface Router {
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
```

### Evaluation Metrics

1. **Arena Score**: Overall performance combining accuracy and cost efficiency
2. **Cost Ratio Score**: Efficiency in cost optimization relative to optimal routing
3. **Optimality Score**: Frequency of selecting the most efficient model for each query
4. **Latency Score**: Router overhead and response time performance
5. **Robustness Score**: Stability against query perturbations and noise

## Contributing

We welcome contributions to the RouterArena platform! Please see our submission guidelines on the website or contact us directly.

## Citation

If you use RouterArena in your research, please cite our paper:

```bibtex
@misc{lu2024routerarena,
  title={RouterArena: An Open Platform for Comprehensive Comparison of LLM Routers}, 
  author={Yifan Lu and Rixin Liu and Jiayi Yuan and Xingqi Cui and Shenrun Zhang and Hongyi Liu and Jiarong Xing},
  year={2024},
  eprint={2510.00202},
  archivePrefix={arXiv},
  primaryClass={cs.LG},
  url={https://arxiv.org/abs/2510.00202}
}
```

## Contact

- **Email**: yifan.lu@rice.edu
- **GitHub**: https://github.com/rice-university/routerarena
- **Paper**: https://www.arxiv.org/abs/2510.00202

## Acknowledgments

We thank all contributors who have made this project possible.