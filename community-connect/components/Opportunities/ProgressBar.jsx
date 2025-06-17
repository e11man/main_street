import React from 'react';

const ProgressBar = ({ progress }) => {
  // Ensure progress is a valid number between 0 and 100
  const validProgress = isNaN(progress) ? 0 : Math.min(Math.max(progress, 0), 100);
  
  // Minimum width for better UX when progress is very low but not zero
  const displayWidth = validProgress === 0 ? 0 : Math.max(validProgress, 3);
  
  return (
    <div className="w-full h-3 bg-border-light/50 rounded-full overflow-hidden relative">
      <div
        className="h-full bg-gradient-to-r from-accent1 to-accent1/80 rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] relative overflow-hidden"
        style={{ width: `${displayWidth}%` }}
      >
        {validProgress > 0 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer transform translate-x-[-100%]"></div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
