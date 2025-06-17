import React from 'react';

const Icon = ({ path, className = 'w-4 h-4 inline-block', ...props }) => {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
    </svg>
  );
};

export default Icon;
