

import {useState, useEffect, useRef} from "react";

interface AnimatedCounterProps {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  startOnView?: boolean;
  threshold?: number;
  id?: string;
  className?: string;
}


export function AnimatedCounter({ 
  end, 
  prefix = "", 
  suffix = "", 
  duration = 1500,
  startOnView = true,
  threshold = 0.5,
  id,
  className = ""
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => { 
        if (entry.isIntersecting && !hasAnimated) {
          setStarted(true);
          setHasAnimated(true);
        }
      },
      { threshold }
    );
    
    const el = id ? document.getElementById(id) : elementRef.current;
    if (el) observer.observe(el);
    
    return () => observer.disconnect();
  }, [startOnView, threshold, id, hasAnimated]);

  useEffect(() => {
    if (!started) return;
    
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { 
        setCount(end); 
        clearInterval(timer); 
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return (
    <span ref={elementRef} className={className}>
      {prefix}{count.toLocaleString("en-IN")}{suffix}
    </span>
  );
}