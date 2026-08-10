import React from 'react';

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...rest
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-label-md transition-all active:scale-95 duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary: 'bg-primary text-on-primary rounded-full hover:bg-primary-container hover:shadow-recipe-hover active:scale-95',
    secondary: 'border border-primary text-primary rounded-full hover:bg-primary/5 active:scale-95',
    ghost: 'text-primary hover:underline hover:bg-transparent active:scale-100'
  };

  const sizes = {
    sm: 'h-8 px-4 text-xs font-semibold',
    md: 'h-12 px-6 text-sm font-semibold',
    lg: 'h-14 px-8 text-base font-semibold'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
