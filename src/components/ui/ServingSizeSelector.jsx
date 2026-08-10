import React from 'react';

export const ServingSizeSelector = ({
  value,
  onChange,
  options = [
    { label: '1x', value: 1 },
    { label: '2x', value: 2 },
    { label: '4x', value: 4 }
  ]
}) => {
  return (
    <div className="inline-flex bg-surface-container-high p-1 rounded-full border border-outline-variant/30">
      {options.map(opt => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-1 rounded-full font-label-md text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-white text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default ServingSizeSelector;
