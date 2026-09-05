import React from 'react';

const Card = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-surface border border-bordercolor rounded-xl shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-bordercolor flex items-center justify-between">
          <h3 className="font-semibold text-textmain text-base">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

export default Card;
