import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react'; // A nice fallback icon for companies

const CompanyLogo = ({ src, name, className = 'w-12 h-12' }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  const handleImageError = () => {
    setError(true);
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  if (error || !imgSrc) {
    return (
      <div className={`${className} rounded-md bg-secondary text-text-secondary flex items-center justify-center font-bold text-lg`}>
        <Building2 />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={`${name} logo`}
      className={`${className} rounded-md object-contain border`}
      onError={handleImageError}
    />
  );
};

export default CompanyLogo;