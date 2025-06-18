import React from 'react';
import Icon from '../ui/Icon';

const FloatingCardSection = () => {
  return (
    <section id="about" className="max-w-screen-xl mx-auto mt-[-60px] md:mt-[-100px] mb-20 md:mb-20 px-6 md:px-8 relative z-20">
      <div className="group rounded-xl md:rounded-2xl overflow-hidden shadow-xl transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] bg-white relative z-10
                      hover:translate-y-[-8px] hover:scale-[1.02] hover:shadow-[0_25px_30px_-12px_rgba(0,0,0,0.2)]">
        <div className="relative w-full h-[280px] md:h-[420px] bg-surface overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent1/10 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30 z-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent2/10 to-accent1/10 rounded-full translate-x-1/2 translate-y-1/2 opacity-20 z-10"></div>
          
          <img
            src="/IMG_2700.jpg"
            alt="Community garden and volunteer activities"
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out
                       group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.9] via-primary/[0.5] to-primary/[0.2] flex items-end p-6 md:p-10 transition-all duration-400 ease-in-out
                          group-hover:bg-gradient-to-t group-hover:from-primary/[0.95] group-hover:via-primary/[0.6] group-hover:to-primary/[0.3]">
            <div className="translate-y-2 opacity-90 transition-all duration-400 ease-in-out
                            group-hover:translate-y-0 group-hover:opacity-100 w-full">
              <h3 className="text-2xl md:text-3xl font-bold mb-2 text-white font-montserrat
                             bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent drop-shadow-sm">Join Our Community</h3>
              <p className="text-base md:text-lg text-white/90 font-source-serif mb-6">Be part of something bigger</p>
              
    
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FloatingCardSection;
