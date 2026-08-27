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
    primary: 'bg-brand-strong text-text-inverse rounded-control hover:bg-brand-hover hover:shadow-recipe-hover active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:ring-offset-2 focus-visible:outline-none',
    secondary: 'bg-card text-brand-strong border border-border-interactive rounded-control hover:bg-surface-container-low active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:ring-offset-2 focus-visible:outline-none',
    ghost: 'text-brand-strong hover:underline hover:bg-transparent active:scale-100 focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none'
  };

  const sizes = {
    sm: 'min-h-[36px] h-9 px-4 text-xs font-semibold',
    md: 'min-h-[44px] h-11 px-6 text-sm font-semibold',
    lg: 'min-h-[48px] h-14 px-8 text-base font-semibold'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      data-variant={variant}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
