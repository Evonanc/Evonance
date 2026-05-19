import { useEffect, useState, useRef } from 'react';
import { useInView } from 'motion/react';

export function useCountUp(
  target: number,
  duration = 1500,
  prefix = '',
  suffix = '',
  decimals = 0
) {
  const [count, setCount] = useState(0);
  const ref = useRef<any>(null);
  const isInView = useInView(ref, { once: true });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isInView || hasStarted.current) return;
    hasStarted.current = true;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutQuad curve
      const easeOutQuad = (t: number) => t * (2 - t);
      const currentVal = easeOutQuad(progress) * target;
      
      setCount(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, target, duration]);

  const formatted = count.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return { ref, value: `${prefix}${formatted}${suffix}` };
}
