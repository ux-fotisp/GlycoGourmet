import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  isLoading = false,
  loadingText,
  onClick,
  type = 'button',
  style,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  const baseStyle =
    'inline-flex items-center justify-center font-label-md transition-all active:scale-95 duration-200 cursor-pointer disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary: isDisabled
      ? 'bg-[#E3DFD5] text-[#9B9B8E] rounded-control'
      : 'btn-gradient-primary text-text-inverse rounded-control hover:shadow-recipe-hover active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:ring-offset-2 focus-visible:outline-none',
    destructive: isDisabled
      ? 'bg-[#E3DFD5] text-[#9B9B8E] rounded-control'
      : 'btn-gradient-destructive text-text-inverse rounded-control hover:shadow-recipe-hover active:scale-95 focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:outline-none',
    secondary: isDisabled
      ? 'bg-[#E3DFD5] text-[#9B9B8E] border border-border-subtle rounded-control'
      : 'bg-card text-brand-strong border border-border-interactive rounded-control hover:bg-surface-container-low active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:ring-offset-2 focus-visible:outline-none',
    ghost: isDisabled
      ? 'text-[#9B9B8E]'
      : 'text-brand-strong hover:underline hover:bg-transparent active:scale-100 focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none',
  };

  const sizes = {
    sm: 'min-h-[36px] h-9 px-4 text-xs font-semibold',
    md: 'min-h-[44px] h-11 px-6 text-sm font-semibold',
    lg: 'min-h-[48px] h-14 px-8 text-base font-semibold',
  };

  // Explicit inline styling ensures deterministic gradient / flat disabled styling in all test & runtime environments
  let variantStyle = {};
  if (isDisabled) {
    variantStyle = {
      backgroundColor: '#E3DFD5',
      color: '#9B9B8E',
      cursor: 'not-allowed',
    };
  } else if (variant === 'primary') {
    variantStyle = {
      background: 'linear-gradient(135deg, #1A3409 0%, #3D6B1E 100%)',
      color: '#FFFFFF',
    };
  } else if (variant === 'destructive') {
    variantStyle = {
      background: 'linear-gradient(135deg, #7B1818 0%, #B02020 100%)',
      color: '#FFFFFF',
    };
  }

  const handleClick = (e) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading ? 'true' : undefined}
      onClick={handleClick}
      style={{ ...variantStyle, ...style }}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      data-variant={variant}
      {...rest}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" aria-hidden="true" />
      )}
      {isLoading ? (loadingText || children) : children}
    </button>
  );
};

export default Button;
