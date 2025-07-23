import { useState, useEffect } from 'react';

export function useAnimatedNumber(endValue, duration = 2000, delay = 100) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now() + delay;
    const endTime = startTime + duration;

    const animateValue = () => {
      const now = Date.now();
      
      if (now < startTime) {
        requestAnimationFrame(animateValue);
        return;
      }

      if (now >= endTime) {
        setCurrentValue(endValue);
        return;
      }

      const progress = (now - startTime) / duration;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentNumber = Math.floor(easeOutQuart * endValue);
      
      setCurrentValue(currentNumber);
      requestAnimationFrame(animateValue);
    };

    const animation = requestAnimationFrame(animateValue);

    return () => cancelAnimationFrame(animation);
  }, [endValue, duration, delay]);

  return currentValue;
}
