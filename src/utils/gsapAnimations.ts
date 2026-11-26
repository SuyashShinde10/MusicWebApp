import gsap from 'gsap';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Staggered entrance animation for cards, nav items, or rows.
 */
export function animateStaggerIn(
  targets: gsap.TweenTarget,
  options?: { y?: number; duration?: number; stagger?: number; delay?: number }
): gsap.core.Tween | null {
  if (prefersReducedMotion()) return null;
  const { y = 14, duration = 0.42, stagger = 0.045, delay = 0 } = options ?? {};
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
 * Crisp micro-pop feedback (used on heart likes, play buttons, and badges).
 */
export function animateMicroPop(target: gsap.TweenTarget): gsap.core.Tween | null {
  if (prefersReducedMotion()) return null;
  return gsap.fromTo(
    target,
    { scale: 0.86 },
    {
      scale: 1,
      duration: 0.36,
      ease: 'back.out(2.4)',
      clearProps: 'transform',
    }
  );
}
