import React, { useState, useEffect } from 'react';

const ProfileAvatar = ({ src, name, className = 'w-8 h-8' }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  const handleImageError = () => {
    setError(true);
  };

  const initials = name ? name.charAt(0).toUpperCase() : '?';

  if (error || !imgSrc) {
    return (
      <div className={`${className} rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm`}>
        {initials}
      </div>
    );
  }

  return (
    <img
    src={imgSrc} // <-- NO MORE PREFIX NEEDED
    alt="Profile"
    className={`${className} rounded-full object-cover`}
    onError={handleImageError}
/>
  );
};

export default ProfileAvatar;