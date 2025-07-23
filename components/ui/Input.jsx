import React from 'react';

const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full py-3 px-4 border border-border/80 rounded-lg font-montserrat text-base text-text-primary bg-white
                  transition-all duration-300 ease-in-out
                  focus:outline-none focus:border-accent1 focus:shadow-[0_0_0_3px_rgba(0,175,206,0.2)]
                  hover:border-accent1/50
                  ${className}`}
      {...props}
    />
  );
};

export default Input;
