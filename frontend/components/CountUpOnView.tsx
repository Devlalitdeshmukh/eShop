import React, { useEffect, useRef, useState } from 'react';

interface CountUpOnViewProps {
  end: number;
  durationMs?: number;
  suffix?: string;
}

const CountUpOnView: React.FC<CountUpOnViewProps> = ({
  end,
  durationMs = 1200,
  suffix = '',
}) => {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    const start = performance.now();
    let raf = 0;

    const tick = (ts: number) => {
      const progress = Math.min((ts - start) / durationMs, 1);
      setValue(Math.floor(progress * end));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, end, durationMs]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
};

export default CountUpOnView;
