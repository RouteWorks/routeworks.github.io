import React from 'react';
import { Router } from '../types';
import { Github } from 'lucide-react';
import huggingFaceLogo from '../assets/images/hf-logo.svg';

interface RouterModelCardProps {
  router: Router;
  isSelected: boolean;
  maxSelectedReached: boolean;
  onToggleCompare: (routerId: string) => void;
}

const RouterModelCard: React.FC<RouterModelCardProps> = ({
  router,
  isSelected,
  maxSelectedReached,
  onToggleCompare,
}) => {
  const primaryLink = router.websiteUrl || router.paperUrl || router.githubUrl;

  return (
    <div className="router-model-card">
      <div className="card-top">
        <div>
          <p className="card-label">Affiliation</p>
          <p className="card-value">{router.affiliation}</p>
        </div>
        <button
          type="button"
          className={`card-compare-btn ${isSelected ? 'selected' : ''}`}
          onClick={() => onToggleCompare(router.id)}
          disabled={!isSelected && maxSelectedReached}
        >
          {isSelected ? 'Remove' : maxSelectedReached ? 'Limit Reached' : 'Add to Compare'}
        </button>
      </div>
      {router.description && <p className="card-description">{router.description}</p>}

      <div className="card-meta-grid">
        <div>
          <p className="card-label">Type</p>
          <span className={`type-badge ${router.type}`}>{router.type}</span>
        </div>
        <div>
          <p className="card-label">Model Pool</p>
          <div className="model-pool">
            {router.modelPool.map(model => (
              <span key={model} className="model-chip">
                {model}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card-links">
        {primaryLink && (
          <a href={primaryLink} target="_blank" rel="noopener noreferrer">
            Visit
          </a>
        )}
        {router.githubUrl && (
          <a href={router.githubUrl} target="_blank" rel="noopener noreferrer" className="link-pill github">
            <Github size={14} />
            GitHub
          </a>
        )}
        {router.huggingfaceUrl && (
          <a
            href={router.huggingfaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-pill huggingface"
          >
            <img src={huggingFaceLogo} alt="Hugging Face logo" className="hf-logo" />
            Hugging Face
          </a>
        )}
      </div>
    </div>
  );
};

export default RouterModelCard;
