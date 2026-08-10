import React, { useState } from 'react';

export const SearchBar = ({ value, onChange, placeholder, className = '' }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`relative w-full transition-all duration-300 ${
        isFocused ? 'scale-[1.01]' : 'scale-100'
      } ${className}`}
    >
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <span className="material-symbols-outlined text-primary text-xl">
          auto_awesome
        </span>
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-full text-base focus:ring-2 focus:ring-primary focus:border-transparent shadow-[0_4px_20px_rgba(45,49,48,0.05)] transition-all outline-none text-on-surface"
      />
    </div>
  );
};

export default SearchBar;
