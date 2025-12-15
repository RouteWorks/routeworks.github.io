import React from 'react';
import { Router } from '../types';
import { Github } from 'lucide-react';
import huggingFaceLogo from '../assets/images/hf-logo.svg';

interface RouterModelCardProps {
  router: Router;
  isSelected: boolean;
  maxSelectedReached: boolean;
  onToggleCompare: (routerId: string) => void;
  onSoloCompare: (routerId: string) => void;
}

const toDisplay = (value: number | null | undefined, digits = 1, prefix = '', suffix = '') => {
  if (value === null || value === undefined) return '—';
  return `${prefix}${value.toFixed(digits)}${suffix}`;
};

const RouterModelCard: React.FC<RouterModelCardProps> = ({
  router,
  isSelected,
  maxSelectedReached,
  onToggleCompare,
  onSoloCompare,
}) => {
  const typeLabel = router.type === 'open-source' ? 'Open source' : 'Closed source';
  const compareButtonLabel = isSelected ? 'Remove from compare' : 'Add to compare';
  const compareDisabled = !isSelected && maxSelectedReached;

  const metricEntries = [
    { label: 'Arena Score', value: toDisplay(router.metrics.arenaScore, 1) },
    { label: 'Accuracy', value: toDisplay(router.metrics.accuracy, 1, '', '%') },
    { label: 'Cost per 1k', value: toDisplay(router.metrics.costPer1k, 2, '$') },
    { label: 'Robustness', value: toDisplay(router.metrics.robustnessScore, 1) },
    { label: 'Latency', value: toDisplay(router.metrics.latencyScore, 1) },
  ];

  const resourceLinks = [
    { label: 'Website', href: router.websiteUrl },
    { label: 'Paper', href: router.paperUrl },
    { label: 'GitHub', href: router.githubUrl, type: 'github' as const },
    { label: 'Hugging Face', href: router.huggingfaceUrl, type: 'huggingface' as const },
  ].filter(link => Boolean(link.href));

  return (
    <div className="router-model-card">
      <div className="router-card-header">
        <div className="router-card-title">
          <span className={`router-type-pill ${router.type}`}>{typeLabel}</span>
          <span className="router-card-affiliation">{router.affiliation}</span>
        </div>
        <div className="router-card-actions">

          <button type="button" className="card-solo-btn" onClick={() => onSoloCompare(router.id)}>
            Compare
          </button>
        </div>
      </div>

      {router.description && <p className="router-card-description">{router.description}</p>}

      <div className="router-card-section">
        <p className="card-label">Model pool</p>
        <div className="model-pool">
          {router.modelPool.map(model => (
            <span key={model} className="model-chip">
              {model}
            </span>
          ))}
        </div>
      </div>

      <div className="router-card-metrics-grid">
        {metricEntries.map(entry => (
          <div key={entry.label} className="router-card-metric">
            <p className="metric-label">{entry.label}</p>
            <p className="metric-value">{entry.value}</p>
          </div>
        ))}
      </div>

      {resourceLinks.length > 0 && (
        <div className="router-card-links">
          {resourceLinks.map(link => {
            if (!link.href) return null;
            if (link.type === 'github') {
              return (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="router-card-link">
                  <Github size={14} />
                  GitHub
                </a>
              );
            }
            if (link.type === 'huggingface') {
              return (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="router-card-link">
                  <img src={huggingFaceLogo} alt="Hugging Face logo" className="hf-logo" />
                  Hugging Face
                </a>
              );
            }
            return (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="router-card-link">
                {link.label}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RouterModelCard;
