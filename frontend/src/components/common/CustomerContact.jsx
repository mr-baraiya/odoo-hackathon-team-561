import React from 'react';
import { Mail } from 'lucide-react';

const CustomerContact = ({ 
  name = 'ABC Company', 
  email = 'customer@abc.com',
  showName = true,
  className = ''
}) => {
  const handleEmail = (e) => {
    e.stopPropagation();
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showName && <span className="text-sm font-medium text-textmain">{name}</span>}
      <button 
        type="button"
        onClick={handleEmail} 
        title={`Send email to ${email}`}
        className="p-1 hover:bg-gray-100 rounded transition-colors text-textsub hover:text-blue-600"
      >
        <Mail className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CustomerContact;
