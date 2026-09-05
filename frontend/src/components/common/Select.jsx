import React from 'react';

const Select = ({ label, options = [], value, onChange, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-textmain mb-1.5">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className={`w-full text-sm text-textmain bg-white border border-bordercolor rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
        {...props}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
