import { useEffect, useRef, useCallback } from 'react';

// Hook for animating counters
export const useAnimatedCounter = (target, duration = 2500, initialDelay = 300) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              const counter = ref.current;
              if (!counter) return;

              const startTime = Date.now();
              const startValue = 0;

              const updateCounter = () => {
                const currentTime = Date.now();
                const progress = Math.min((currentTime - startTime) / duration, 1);
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);

                counter.textContent = currentValue.toLocaleString();

                if (progress < 1) {
                  requestAnimationFrame(updateCounter);
                } else {
                  counter.textContent = target.toLocaleString();
                  counter.style.animation = 'pulse 1.5s ease infinite';
                }
              };
              updateCounter();
            }, initialDelay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [target, duration, initialDelay]);

  return ref;
};

// Hook for scroll-triggered animations
export const useScrollTriggeredAnimation = (elementsRef, initialClasses, visibleClasses, observerOptions) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            if (entry.target) {
              // Remove initial classes and add visible classes
              initialClasses.split(' ').forEach(cls => entry.target.classList.remove(cls));
              visibleClasses.split(' ').forEach(cls => entry.target.classList.add(cls));
              // Ensure transition is applied after initial classes are removed
              entry.target.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }
          }, index * 120);

          // For opportunity cards, also add pulse animation to category tag
          if (entry.target.classList.contains('opportunity-card')) {
            const categoryTag = entry.target.querySelector('.card-category');
            if (categoryTag) {
              setTimeout(() => {
                categoryTag.style.animation = 'pulse 2s infinite';
              }, index * 120 + 500);
            }
          }
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (elementsRef.current) {
      elementsRef.current.forEach(el => {
        if (el) {
          // Initialize with initial classes
          initialClasses.split(' ').forEach(cls => el.classList.add(cls));
          observer.observe(el);
        }
      });
    }

    return () => {
      if (elementsRef.current) {
        elementsRef.current.forEach(el => {
          if (el) {
            observer.unobserve(el);
          }
        });
      }
    };
  }, [elementsRef, initialClasses, visibleClasses, observerOptions]);
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

