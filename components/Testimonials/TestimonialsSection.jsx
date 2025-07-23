import React from 'react';
import TestimonialCard from './TestimonialCard';

const TestimonialsSection = ({ testimonialRefs }) => {
  const testimonials = [
    {
      id: 1,
      text: "Community Connect helped me find the perfect volunteer opportunity. I've made lifelong friends while making a real difference in upland.",
      author: 'Sarah Johnson, Volunteer',
    },
    {
      id: 2,
      text: "The platform made it so easy to find volunteers for our literacy program. We've been able to reach twice as many students this year.",
      author: 'Marcus Chen, Program Director',
    },
    {
      id: 3,
      text: "I love how the opportunities are categorized and filtered. It's never been easier to find causes I'm passionate about.",
      author: 'Emma Rodriguez, Student',
    },
  ];

  return (
    <section id="impact" className="bg-surface py-16 md:py-24 my-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-20 h-20 md:w-40 md:h-40 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 md:w-60 md:h-60 bg-accent1/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
      
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        {/* Section header with improved styling */}
        <div className="text-center mb-16 relative">
          <h2 className="testimonials h2 font-montserrat text-3xl md:text-4xl font-extrabold mb-4 text-primary inline-block relative">
            Stories of Impact
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-accent1 rounded-full"></span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto mt-6">
            Discover how Community Connect is bringing people together and making a difference in upland.
          </p>
        </div>
        
        {/* Testimonial cards with improved layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              ref={el => testimonialRefs.current[index] = el}
            />
          ))}
        </div>
        

      </div>
    </section>
  );
};

export default TestimonialsSection;
