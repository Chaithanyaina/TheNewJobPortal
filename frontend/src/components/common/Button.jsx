import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  isLoading = false,
  disabled = false,
}) => {
  const baseStyles = 'w-full px-4 py-2.5 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-secondary text-text-primary hover:bg-gray-300 focus:ring-primary',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;