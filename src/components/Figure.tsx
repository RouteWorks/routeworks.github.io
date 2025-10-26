import React from 'react';
import './Figure.css';

interface FigureProps {
  src: string;
  alt: string;
  caption: string;
  className?: string;
}

const Figure: React.FC<FigureProps> = ({ src, alt, caption, className = '' }) => {
  const handleImageLoad = () => {
    console.log('Image loaded successfully:', src);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', src, e);
  };

  return (
    <figure className={`figure ${className}`}>
      <div className="figure-container">
        <img
          src={src}
          alt={alt}
          className="figure-image"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
      <figcaption className="figure-caption">{caption}</figcaption>
    </figure>
  );
};

export default Figure;
