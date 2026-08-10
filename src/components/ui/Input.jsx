import React from 'react';

export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  id,
  className = '',
  suffix,
  ...rest
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block"
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-white border ${
            error ? 'border-error focus:ring-error/20' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
          } rounded-lg h-12 pl-4 pr-10 focus:ring-2 outline-none transition-all font-body-md text-on-surface`}
          {...rest}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <span className="text-error text-xs font-medium mt-0.5">{error}</span>
      )}
    </div>
  );
};


export default Input;
