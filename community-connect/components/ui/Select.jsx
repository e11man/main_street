import React from 'react';

const Select = ({ className = '', ...props }) => {
  return (
    <select
      className={`w-full py-3 px-4 border border-border rounded-md font-source-serif text-base text-text-primary bg-white
                  transition-all duration-200 ease-in-out
                  focus:outline-none focus:border-taylor-purple focus:shadow-taylor-purple-focus
                  ${className}`}
      {...props}
    />
  );
};

export default Select;
