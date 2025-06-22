import { useEffect, useRef, useCallback, useState } from 'react';

// Hook for animating counters with intersection observer
export const useAnimatedCounter = (target, duration = 2500, initialDelay = 300) => {
  const [value, setValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  // Detect when element is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [isVisible]);

  // Animate the counter when visible
  useEffect(() => {
    if (!isVisible) return;
    
    let animationFrame;
    let startTime;

    const animate = () => {
      const currentTime = Date.now();
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(0 + (target - 0) * easeOutQuart);

      setValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const timeoutId = setTimeout(() => {
      startTime = Date.now();
      animationFrame = requestAnimationFrame(animate);
    }, initialDelay);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, target, duration, initialDelay]);

  return { value, ref };
};


// Hook for scroll-triggered animations (multiple elements)
export const useScrollTriggeredAnimation = (elementsRef, initialClasses, visibleClasses, observerOptions) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            if (entry.target) {
              // Remove initial classes and add visible classes
              initialClasses.split(' ').filter(Boolean).forEach(cls => entry.target.classList.remove(cls));
              visibleClasses.split(' ').filter(Boolean).forEach(cls => entry.target.classList.add(cls));
              // Remove transition and animation for fade in/out
              entry.target.style.transition = '';
            }
          }, index * 120);

          // For opportunity cards, REMOVE pulse animation from category tag
          if (entry.target.classList.contains('opportunity-card')) {
            const categoryTag = entry.target.querySelector('.card-category');
            if (categoryTag) {
              categoryTag.style.animation = '';
            }
          }
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (elementsRef.current && Array.isArray(elementsRef.current)) {
      elementsRef.current.forEach(el => {
        if (el) {
          // Initialize with initial classes
          initialClasses.split(' ').filter(Boolean).forEach(cls => el.classList.add(cls));
          observer.observe(el);
        }
      });
    }

    return () => {
      if (elementsRef.current && Array.isArray(elementsRef.current)) {
        elementsRef.current.forEach(el => {
          if (el) {
            observer.unobserve(el);
          }
        });
      }
    };
  }, [elementsRef, initialClasses, visibleClasses, observerOptions]);
};

// Hook for single element scroll-triggered animation with callback
export const useScrollTriggeredAnimationCallback = (elementRef, callback, options = {}) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (callback) {
          callback(entry);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px',
      ...options
    });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [elementRef, callback, options]);
};


// Hook for smooth scrolling to anchor links
export const useSmoothScroll = () => {
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const href = e.currentTarget.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 80, // Account for header height
            behavior: 'smooth'
          });

          // Highlight the section briefly
          setTimeout(() => {
            target.style.transition = 'all 0.5s ease';
            target.style.boxShadow = '0 0 0 3px rgba(82, 45, 114, 0.2)';
            setTimeout(() => {
              target.style.boxShadow = '';
            }, 700);
          }, 500);
        }
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
    };
  }, []);
};

// Hook for parallax effect on an element
export const useParallaxEffect = (ref, speed = 0.15, opacityDecay = 0.002, maxScroll = 600) => {
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 768 && ref.current) {
        const scrolled = window.pageYOffset;
        if (scrolled < maxScroll) {
          ref.current.style.transform = `translateY(${scrolled * speed}px)`;
          ref.current.style.opacity = 1 - (scrolled * opacityDecay);
        } else {
          ref.current.style.transform = `translateY(${maxScroll * speed}px)`;
          ref.current.style.opacity = 1 - (maxScroll * opacityDecay);
        }
      } else if (ref.current) {
        // Reset styles for mobile or smaller screens
        ref.current.style.transform = '';
        ref.current.style.opacity = '';
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once on mount to set initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [ref, speed, opacityDecay, maxScroll]);
};

// Hook for header scroll behavior (hide/show on scroll, shrink on desktop)
export const useHeaderScrollBehavior = (headerRef, mobileNavRef) => {
  useEffect(() => {
    let lastScrollTop = 0;
    let isHeaderHidden = false;
    let scrollTimer = null;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const header = headerRef.current;
      const mobileNav = mobileNavRef.current;

      if (!header) return;

      // Add scrolled attribute for styling with smoother transition
      if (scrollTop > 20) {
        header.setAttribute('data-scrolled', 'true');
      } else {
        header.removeAttribute('data-scrolled');
      }

      // Hide/show header on scroll with improved animation for all devices
      if (scrollTop > lastScrollTop && scrollTop > 80 && !isHeaderHidden) {
        // Scrolling DOWN - hide header
        header.style.transform = 'translateY(-100%)';
        header.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
        isHeaderHidden = true;
        if (mobileNav && mobileNav.classList.contains('active')) {
          mobileNav.classList.remove('active');
        }
      } else if ((scrollTop < lastScrollTop || scrollTop < 50) && isHeaderHidden) {
        // Scrolling UP or near top - show header
        header.style.transform = 'translateY(0)';
        header.style.transition = 'transform 0.4s cubic-bezier(0.0, 0.0, 0.2, 1)';
        isHeaderHidden = false;
      }

      // Clear previous timer and set a new one
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        // If user stops scrolling near the top, always show header
        if (scrollTop < 50 && isHeaderHidden) {
          header.style.transform = 'translateY(0)';
          isHeaderHidden = false;
        }
      }, 150);

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [headerRef, mobileNavRef]);
};

// Hook for handling click outside a component
export const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

