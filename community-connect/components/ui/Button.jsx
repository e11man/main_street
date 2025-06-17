import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'relative overflow-hidden z-10 whitespace-nowrap font-montserrat font-semibold cursor-pointer transition-all duration-300 ease-in-out';
  let variantClasses = '';

  switch (variant) {
    case 'primary':
      variantClasses = `bg-primary text-white py-3 px-6 rounded-md text-sm
                        hover:bg-primary-light hover:translate-y-[-2px] hover:shadow-md
                        active:translate-y-0 active:shadow-sm
                        before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-400 before:ease-in-out before:-z-10
                        hover:before:left-[100%]`;
      break;
    case 'secondary':
      variantClasses = `bg-accent1 text-white py-3 px-6 rounded-md text-sm
                        hover:bg-primary hover:translate-y-[-2px] hover:shadow-[0_4px_12px_rgba(27,54,95,0.25)] hover:text-white
                        active:translate-y-0 active:shadow-sm
                        before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-400 before:ease-in-out before:-z-10
                        hover:before:left-[100%]
                        focus:outline-none focus:shadow-taylor-purple-focus`;
      break;
    case 'outline':
      variantClasses = `bg-transparent text-text-secondary border border-border py-3 px-6 rounded-md text-sm font-medium
                        hover:text-primary hover:border-primary hover:translate-y-[-1px] hover:shadow-[0_2px_8px_rgba(27,54,95,0.1)]
                        active:translate-y-0
                        after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0 after:bg-surface-hover after:transition-all after:duration-300 after:ease-in-out after:-z-10
                        hover:after:h-full`;
      break;
    case 'cancel':
      variantClasses = `bg-transparent text-text-secondary border border-border py-3 px-6 rounded-md text-sm font-medium
                        hover:bg-surface hover:text-text-primary hover:border-text-secondary transition-all duration-200 ease-in-out`;
      break;
    default:
      variantClasses = `bg-primary text-white py-3 px-6 rounded-md text-sm`; // Fallback to primary
  }

  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
