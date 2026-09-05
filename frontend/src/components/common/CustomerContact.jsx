import React from 'react';
import { MessageCircle, Mail } from 'lucide-react';

const CustomerContact = ({ 
  name = 'ABC Company', 
  phone = '919876543210', 
  email = 'customer@abc.com',
  showName = true,
  className = ''
}) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  
  const handleWhatsApp = (e) => {
    e.stopPropagation();
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleEmail = (e) => {
    e.stopPropagation();
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showName && <span className="text-sm font-medium text-textmain">{name}</span>}
      <button 
        type="button"
        onClick={handleWhatsApp} 
        title={`Chat on WhatsApp (${phone})`}
        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
      >
        <MessageCircle className="w-4 h-4 text-emerald-600" />
      </button>
      <button 
        type="button"
        onClick={handleEmail} 
        title={`Send Email to ${email}`}
        className="p-1 text-sky-600 hover:bg-sky-50 rounded transition-colors"
      >
        <Mail className="w-4 h-4 text-sky-600" />
      </button>
    </div>
  );
};

export default CustomerContact;
