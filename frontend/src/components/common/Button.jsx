import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2D6B8F]/20 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#2D6B8F] text-white hover:bg-[#245673]',
    secondary: 'bg-[#5A6B7C] text-white hover:bg-[#475564]',
    success: 'bg-[#2E7D5E] text-white hover:bg-[#25664D]',
    danger: 'bg-[#D32F2F] text-white hover:bg-[#B71C1C]',
    outline: 'border border-[#E8ECF1] text-[#1A1D23] bg-white hover:bg-[#F7F8FA] hover:border-[#CBD5E1]',
    ghost: 'text-[#5A6B7C] hover:bg-[#F7F8FA] hover:text-[#1A1D23]'
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export default Button;
