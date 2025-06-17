import React from 'react';
import { useAnimatedCounter } from '../../lib/hooks';
import Icon from '../ui/Icon';

const StatItem = ({ target, label, icon, className = '' }) => {
  const counterRef = useAnimatedCounter(target);

  return (
    <div className={`text-center p-6 md:p-8 bg-white/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg
                    transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] relative z-10 overflow-hidden
                    hover:translate-y-[-8px] hover:scale-[1.03] hover:shadow-xl hover:bg-white hover:border-accent1/30
                    before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full 
                    before:bg-gradient-to-br before:from-primary/5 before:to-accent1/5 before:-z-10 
                    before:scale-x-0 before:origin-left before:transition-transform before:duration-500 before:ease-in-out
                    hover:before:scale-x-100 ${className}`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/8 to-accent1/8 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-accent2/8 to-accent1/8 rounded-full translate-x-1/2 translate-y-1/2 opacity-30"></div>
      
      {/* Icon */}
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full inline-block">
            <Icon path={icon} className="w-6 h-6 text-primary" />
          </div>
        </div>
      )}
      
      {/* Counter */}
      <span
        ref={counterRef}
        className="font-montserrat text-4xl md:text-5xl font-extrabold mb-3 block
                   bg-gradient-to-r from-primary to-accent1 bg-clip-text text-transparent
                   drop-shadow-sm"
        data-count={target}
      >
        0
      </span>
      
      {/* Label */}
      <span className="font-montserrat text-sm md:text-base text-text-secondary font-medium inline-block px-3 py-1 rounded-full bg-surface">
        {label}
      </span>
    </div>
  );
};

export default StatItem;
