import React from 'react';

const Input = ({ label, error, icon: Icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-textmain mb-1.5">{label}</label>}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textsub">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          className={`w-full text-sm text-textmain bg-white border border-bordercolor rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            Icon ? 'pl-9' : ''
          } ${error ? 'border-rose-500 focus:ring-rose-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
