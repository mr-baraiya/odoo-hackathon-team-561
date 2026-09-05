import React from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-xl border border-bordercolor shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-bordercolor flex items-center justify-between">
          <h3 className="font-semibold text-textmain text-base">{title}</h3>
          <button onClick={onClose} className="p-1 text-textsub hover:text-textmain hover:bg-hoverbg rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-bordercolor bg-hoverbg flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
