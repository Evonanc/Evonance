import React, { useState, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
}

function OptimizedImage({
  src,
  alt,
  fallback = '/favicon.svg', // fallback default icon
  className = '',
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  useEffect(() => {
    setLoaded(false);
    setError(false);
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setCurrentSrc(src);
      setLoaded(true);
    };
    
    img.onerror = () => {
      setError(true);
      setCurrentSrc(fallback);
      setLoaded(true);
    };
  }, [src, fallback]);

  return (
    <div className={`relative overflow-hidden bg-secondary/30 ${className}`}>
      {/* Premium Shimmer skeleton loader shown until loaded */}
      {!loaded && (
        <div className="absolute inset-0 skeleton" />
      )}
      
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
}

export default React.memo(OptimizedImage);
