import gsap from 'gsap';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Silky staggered entrance animation for cards, nav items, or sections.
 */
export function animateStaggerIn(
  targets: gsap.TweenTarget,
  options?: { y?: number; duration?: number; stagger?: number; delay?: number }
): gsap.core.Tween | null {
  if (prefersReducedMotion()) return null;
  const { y = 10, duration = 0.34, stagger = 0.025, delay = 0 } = options ?? {};
  return gsap.fromTo(
    targets,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      delay,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    }
  );
}

/**
 * Tactile micro-pop feedback (used on heart likes, play buttons, and add pills).
 */
export function animateMicroPop(target: gsap.TweenTarget): gsap.core.Tween | null {
  if (prefersReducedMotion()) return null;
  return gsap.fromTo(
    target,
    { scale: 0.88 },
    {
      scale: 1,
      duration: 0.32,
      ease: 'back.out(2.2)',
      clearProps: 'transform',
    }
  );
}
