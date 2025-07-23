import React, { forwardRef } from 'react';

const TestimonialCard = forwardRef(({ testimonial }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white p-6 md:p-8 rounded-lg md:rounded-xl border border-border shadow-sm
                 transition-all duration-400 ease-in-out relative top-0
                 hover:translate-y-[-6px] hover:scale-[1.02] hover:shadow-md hover:border-accent1-light
                 overflow-hidden"
    >
      {/* Decorative accent element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent1"></div>
      
      {/* Quote mark */}
      <span className="absolute top-2 left-5 md:top-3 md:left-5 text-8xl font-serif text-primary/10 leading-none">
        &quot;
      </span>
      
      {/* Testimonial text */}
      <p className="italic text-base text-text-secondary mb-6 leading-relaxed pt-4 relative z-10">
        &quot;{testimonial.text}&quot;
      </p>
      
      {/* Author info with enhanced styling */}
      <div className="flex items-center border-t border-border-light pt-4">
        <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center mr-3">
          <span className="text-primary font-semibold">{testimonial.author.charAt(0)}</span>
        </div>
        <div>
          <div className="font-montserrat font-semibold text-sm text-primary">
            {testimonial.author.split(',')[0]}
          </div>
          <div className="text-xs text-accent2">
            {testimonial.author.includes(',') ? testimonial.author.split(',')[1].trim() : ''}
          </div>
        </div>
      </div>
    </div>
  );
});

TestimonialCard.displayName = 'TestimonialCard';

export default TestimonialCard;
