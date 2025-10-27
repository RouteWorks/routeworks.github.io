import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import './DatasetCompositionChart.css';

interface CategoryData {
  [key: string]: {
    [key: string]: number;
  };
}

interface ChartData {
  name: string;
  value: number;
  category: string;
  color: string;
  subcategories?: SubcategoryData[];
}

interface SubcategoryData {
  name: string;
  value: number;
  color: string;
  parentCategory: string;
}

const categoryData: CategoryData = {
  "Computer Science, information science, and general works": {
    "Computer science, knowledge, and systems": 1004,
    "Library and information science": 396
  },
  "Philosophy and psychology": {
    "Philosophy": 122,
    "Psychology": 187,
    "Philosophical logic": 108,
    "Ethics": 283
  },
  "Social Science": {
    "Social sciences, sociology and anthropology": 55,
    "Economics": 426,
    "Law": 158,
    "Social problems": 61
  },
  "Language": {
    "Language": 700
  },
  "Science": {
    "Science": 114,
    "Mathematics": 601,
    "Physics": 97,
    "Chemistry": 90,
    "Earth sciences and geology": 330,
    "Biology": 143,
    "Animals (Zoology)": 25
  },
  "Technology": {
    "Medicine and health": 992,
    "Engineering": 335,
    "Management and public relations": 73
  },
  "Arts & recreation": {
    "Arts": 154,
    "Music": 240,
    "Sports, games and entertainment": 306
  },
  "Literature": {
    "Literature, rhetoric and criticism": 700
  },
  "History": {
    "History": 498,
    "Geography": 150,
    "Biography and genealogy": 52
  }
};

// Color palette for categories
const categoryColors = [
  '#3B82F6', // Blue
  '#F59E0B', // Orange
  '#10B981', // Green
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Brown
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#FBBF24', // Yellow
];

// Difficulty level colors
const difficultyColors = {
  'Easy': '#22C55E',
  'Medium': '#F59E0B',
  'Hard': '#EF4444'
};

// Helper function to get a lighter shade of a color
const getLighterColor = (color: string, opacity: number = 0.7) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const DatasetCompositionChart: React.FC = () => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null);

  // Define chart dimensions as constants for easy adjustment
  const CHART_DIMENSIONS = {
    innerRadius: 100,
    outerRadius: 250,
    labelRadius: 330, // Distance from center to labels
    chartSize: 800 // Container height
  };

  // Prepare data for the main pie chart (outer ring)
  const prepareMainChartData = (): ChartData[] => {
    const data: ChartData[] = [];
    let colorIndex = 0;

    Object.entries(categoryData).forEach(([category, subcategories]) => {
      const totalValue = Object.values(subcategories).reduce((sum, value) => sum + value, 0);
      const subcategoryData = Object.entries(subcategories).map(([name, value]) => ({
        name,
        value,
        color: getLighterColor(categoryColors[colorIndex % categoryColors.length]),
        parentCategory: category
      }));

      data.push({
        name: category,
        value: totalValue,
        category: category,
        color: categoryColors[colorIndex % categoryColors.length],
        subcategories: subcategoryData
      });
      colorIndex++;
    });

    return data;
  };

  // Prepare data for subcategories (inner ring)
  const prepareSubcategoryData = (): SubcategoryData[] => {
    const data: SubcategoryData[] = [];
    let colorIndex = 0;

    Object.entries(categoryData).forEach(([category, subcategories]) => {
      Object.entries(subcategories).forEach(([name, value]) => {
        data.push({
          name,
          value,
          color: getLighterColor(categoryColors[colorIndex % categoryColors.length]),
          parentCategory: category
        });
      });
      colorIndex++;
    });

    return data;
  };

  const mainChartData = prepareMainChartData();
  const subcategoryData = prepareSubcategoryData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      // Get subcategory descriptions
      const getSubcategoryDescription = (name: string, parent: string) => {
        const descriptions: { [key: string]: { [key: string]: string } } = {
          'Computer Science, information science, and general works': {
            'Computer science, knowledge, and systems': 'Core CS concepts & systems',
            'Library and information science': 'Information management & retrieval'
          },
          'Philosophy and psychology': {
            'Philosophy': 'Fundamental questions & reasoning',
            'Psychology': 'Human behavior & cognition',
            'Philosophical logic': 'Logical reasoning & argumentation',
            'Ethics': 'Moral principles & values'
          },
          'Social Science': {
            'Social sciences, sociology, and anthropology': 'Human societies & cultures',
            'Economics': 'Resource allocation & markets',
            'Law': 'Legal systems & regulations',
            'Social problems': 'Contemporary social issues'
          },
          'Language': {
            'Language': 'Linguistics & communication'
          },
          'Science': {
            'Science': 'General scientific principles',
            'Mathematics': 'Mathematical concepts & proofs',
            'Physics': 'Physical laws & phenomena',
            'Chemistry': 'Chemical reactions & compounds',
            'Earth sciences and geology': 'Earth processes & materials',
            'Biology': 'Living organisms & life processes',
            'Animals (Zoology)': 'Animal behavior & classification'
          },
          'Technology': {
            'Medicine and health': 'Medical knowledge & healthcare',
            'Engineering': 'Applied science & design',
            'Management and public relations': 'Business & organizational skills'
          },
          'Arts & recreation': {
            'Arts': 'Creative expression & aesthetics',
            'Music': 'Musical theory & performance',
            'Sports, games and entertainment': 'Recreation & leisure activities'
          },
          'Literature': {
            'Literature, rhetoric and criticism': 'Written works & analysis'
          },
          'History': {
            'History': 'Past events & developments',
            'Geography': 'Earth\'s features & locations',
            'Biography and genealogy': 'Personal histories & lineages'
          }
        };

        return descriptions[parent]?.[name] || name;
      };

      return (
        <div className="chart-tooltip">
          <p className="tooltip-title">{data.name}</p>
          <p className="tooltip-value">{data.value.toLocaleString()} queries</p>
          {data.parentCategory && (
            <p className="tooltip-category">{getSubcategoryDescription(data.name, data.parentCategory)}</p>
          )}
        </div>
      );
    }
    return null;
  };


  return (
    <div className="dataset-composition-chart">
      <div className="chart-container">
        {/* Two-Ring Pie Chart */}
        <div className="pie-chart-container" style={{ position: 'relative', zIndex: 10 }}>
          <ResponsiveContainer width="100%" height={CHART_DIMENSIONS.chartSize}>
            <PieChart>
              {/* Inner ring - Subcategories */}
              <Pie
                data={subcategoryData}
                cx="50%"
                cy="50%"
                innerRadius={CHART_DIMENSIONS.innerRadius}
                outerRadius={CHART_DIMENSIONS.innerRadius + 50}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={0}
                onMouseEnter={(data) => setHoveredSubcategory(data.name)}
                onMouseLeave={() => setHoveredSubcategory(null)}
              >
                {subcategoryData.map((entry, index) => (
                  <Cell
                    key={`subcell-${index}`}
                    fill={entry.color}
                    stroke={hoveredSubcategory === entry.name ? '#d1d5db' : '#fff'}
                    strokeWidth={hoveredSubcategory === entry.name ? 2 : 1}
                    style={{
                      filter: hoveredSubcategory === entry.name ? 'brightness(1.1) saturate(1.1)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </Pie>

              {/* Outer ring - Main categories */}
              <Pie
                data={mainChartData}
                cx="50%"
                cy="50%"
                innerRadius={CHART_DIMENSIONS.innerRadius + 60}
                outerRadius={CHART_DIMENSIONS.outerRadius}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
                animationBegin={0}
                animationDuration={0}
                onMouseEnter={(data) => setHoveredCategory(data.category)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {mainChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={hoveredCategory === entry.category ? '#9ca3af' : '#fff'}
                    strokeWidth={hoveredCategory === entry.category ? 2 : 1}
                    style={{
                      filter: hoveredCategory === entry.category ? 'brightness(1.12) saturate(1.15)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 9999 }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Independent SVG Labels Overlay */}
          <svg
            className="labels-svg-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 0
            }}
            viewBox="0 0 800 800"
          >
            {mainChartData.map((entry, index) => {
              const totalValue = mainChartData.reduce((sum, item) => sum + item.value, 0);
              let cumulativeValue = 0;

              for (let i = 0; i < index; i++) {
                cumulativeValue += mainChartData[i].value;
              }

              const startAngle = (cumulativeValue / totalValue) * 360 - 90;
              const endAngle = ((cumulativeValue + entry.value) / totalValue) * 360 - 90;
              const midAngle = (startAngle + endAngle) / 2;

              const RADIAN = Math.PI / 180;
              // Adaptive label radius: farther for sides, closer for top/bottom
              const baseOffset = 60;   // baseline distance beyond pie edge
              const sideBoost = 40;    // extra distance for left/right labels
              const angleFactor = Math.abs(Math.sin(midAngle * RADIAN)); 
              // 0 for top/bottom, 1 for sides

              const radius = CHART_DIMENSIONS.outerRadius + baseOffset + sideBoost * angleFactor;
                          
              // Use exact center coordinates matching Recharts
              const centerX = 400; // Exact center of 800x800 viewBox
              const centerY = 400; // Exact center of 800x800 viewBox
              const x = centerX - radius * Math.sin(midAngle * RADIAN);
              const y = centerY - radius * Math.cos(midAngle * RADIAN);

              // Create shortened versions of category names
              const getShortName = (name: string) => {
                const shortNames: { [key: string]: string } = {
                  'Computer Science, information science, and general works': 'Computer Science',
                  'Philosophy and psychology': 'Philosophy',
                  'Social Science': 'Social Science',
                  'Language': 'Language',
                  'Science': 'Science',
                  'Technology': 'Technology',
                  'Arts & recreation': 'Arts',
                  'Literature': 'Literature',
                  'History': 'History'
                };
                return shortNames[name] || name;
              };

              const shortName = getShortName(entry.name);

              return (
                <g key={index}>
                  <rect
                    x={x - 50}
                    y={y - 15}
                    width="100"
                    height="30"
                    fill="rgba(255, 255, 255, 0.8)"
                    stroke="none"
                    rx="4"
                  />
                  <text
                    x={x}
                    y={y}
                    fill="#1f2937"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="19"
                    fontWeight="700"
                  >
                    {shortName}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

      </div>
    </div>
  );
};

export default DatasetCompositionChart;
