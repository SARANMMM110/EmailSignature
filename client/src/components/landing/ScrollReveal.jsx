import { useEffect, useRef } from 'react';

export function ScrollReveal({ as: Comp = 'div', stagger = false, className = '', children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Comp
      ref={ref}
      className={`${stagger ? 'scroll-reveal-stagger' : 'scroll-reveal'} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Comp>
  );
}
