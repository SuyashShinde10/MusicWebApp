import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Pause, Play, Plus } from 'lucide-react';
import type { Song } from '../../types/music';
import { formatDuration } from '../../utils/formatters';
import { animateMicroPop, prefersReducedMotion } from '../../utils/gsapAnimations';
import { AlbumArt } from './AlbumArt';

interface FeaturedShowcaseProps {
  songs: Song[];
  currentSongId: Song['id'] | null;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
}

const SWIPE_THRESHOLD = 46;
const AUTO_SCROLL_INTERVAL_MS = 3500;

export function FeaturedShowcase({
  songs,
  currentSongId,
  isPlaying,
  onPlay,
  onAddToPlaylist,
}: FeaturedShowcaseProps) {
  const featured = songs.slice(0, 6);
  const initialIdx = Math.max(
    0,
    featured.findIndex((s) => s.title.toLowerCase().includes('echoes'))
  );
  const [activeIndex, setActiveIndex] = useState(initialIdx);
  const [slideDirection, setSlideDirection] = useState<-1 | 0 | 1>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isPageHidden, setIsPageHidden] = useState(
    () => typeof document !== 'undefined' && document.hidden
  );

  const stageRef = useRef<HTMLDivElement>(null);
  const mobileCardRef = useRef<HTMLDivElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const dragStateRef = useRef<{
    active: boolean;
    pointerId: number;
    startX: number;
    deltaX: number;
    moved: boolean;
  }>({ active: false, pointerId: -1, startX: 0, deltaX: 0, moved: false });

  const count = featured.length;
  const safeIndex = count > 0 ? ((activeIndex % count) + count) % count : 0;
  const activeSong = featured[safeIndex];

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const handleVisibility = () => setIsPageHidden(document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (count <= 1 || isHovered || isDragging || isFocusWithin || isPageHidden) return undefined;

    const timerId = window.setInterval(() => {
      setSlideDirection(1);
      setActiveIndex((prev) => ((prev + 1) % count + count) % count);
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [count, isHovered, isDragging, isFocusWithin, isPageHidden, safeIndex]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const enterX = slideDirection * 42;

    const ctx = gsap.context(() => {
      if (stageRef.current) {
        gsap.fromTo(
          '.showcase-center',
          { x: enterX, scale: 0.93, opacity: 0.8 },
          {
            x: 0,
            scale: 1,
            opacity: 1,
            duration: 0.52,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          }
        );
        gsap.fromTo(
          '.showcase-flank',
          { x: enterX * 0.55, y: 4, opacity: 0.72 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.46,
            stagger: 0.025,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          }
        );
      }
      if (mobileCardRef.current) {
        gsap.fromTo(
          mobileCardRef.current,
          { x: enterX * 0.8, scale: 0.97, opacity: 0.86 },
          {
            x: 0,
            scale: 1,
            opacity: 1,
            duration: 0.44,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          }
        );
      }
    });
    return () => ctx.revert();
  }, [safeIndex, slideDirection]);

  if (!activeSong) return null;

  const getRelativeSong = (offset: number): Song | undefined => {
    if (count === 0) return undefined;
    return featured[((safeIndex + offset) % count + count) % count];
  };

  const farLeft = count >= 5 ? getRelativeSong(-2) : undefined;
  const nearLeft = count >= 3 ? getRelativeSong(-1) : undefined;
  const nearRight = count >= 2 ? getRelativeSong(1) : undefined;
  const farRight = count >= 4 ? getRelativeSong(2) : undefined;
  const isCurrentActive = currentSongId === activeSong.id;

  const selectOffset = (offset: number) => {
    setSlideDirection(offset > 0 ? 1 : offset < 0 ? -1 : 0);
    setActiveIndex((prev) => ((prev + offset) % count + count) % count);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || count <= 1) return;
    dragStateRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      deltaX: 0,
      moved: false,
    };
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore capture errors in synthetic test environments
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragStateRef.current;
    if (!d.active || d.pointerId !== e.pointerId) return;
    const rawDelta = e.clientX - d.startX;
    const clamped = Math.max(-170, Math.min(170, rawDelta));
    d.deltaX = clamped;
    if (Math.abs(rawDelta) > 6) {
      d.moved = true;
    }

    if (prefersReducedMotion()) return;
    const progress = Math.min(1, Math.abs(clamped) / 140);

    if (stageRef.current) {
      const centerEl = stageRef.current.querySelector('.showcase-center');
      const nearEls = stageRef.current.querySelectorAll('.showcase-near');
      const farEls = stageRef.current.querySelectorAll('.showcase-far');
      if (centerEl) {
        gsap.set(centerEl, {
          x: clamped * 0.9,
          rotateY: clamped * 0.06,
          rotateZ: clamped * 0.018,
          scale: 1 - progress * 0.06,
        });
      }
      if (nearEls.length > 0) {
        gsap.set(nearEls, { x: clamped * 0.58, scale: 1 + progress * 0.04 });
      }
      if (farEls.length > 0) {
        gsap.set(farEls, { x: clamped * 0.32 });
      }
    }

    if (mobileCardRef.current) {
      gsap.set(mobileCardRef.current, {
        x: clamped * 0.82,
        rotateZ: clamped * 0.015,
        scale: 1 - progress * 0.03,
      });
    }
  };

  const resetDragTransforms = () => {
    if (prefersReducedMotion()) return;
    const targets: Element[] = [];
    if (stageRef.current) {
      stageRef.current
        .querySelectorAll('.showcase-center, .showcase-near, .showcase-far')
        .forEach((el) => targets.push(el));
    }
    if (mobileCardRef.current) {
      targets.push(mobileCardRef.current);
    }
    if (targets.length > 0) {
      gsap.to(targets, {
        x: 0,
        rotateY: 0,
        rotateZ: 0,
        scale: 1,
        duration: 0.45,
        ease: 'elastic.out(1, 0.72)',
        clearProps: 'transform',
      });
    }
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragStateRef.current;
    if (!d.active || d.pointerId !== e.pointerId) return;
    d.active = false;
    setIsDragging(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore capture errors
    }

    if (Math.abs(d.deltaX) >= SWIPE_THRESHOLD) {
      const direction = d.deltaX < 0 ? 1 : -1;
      if (stageRef.current) {
        gsap.set(
          stageRef.current.querySelectorAll('.showcase-center, .showcase-near, .showcase-far'),
          { clearProps: 'transform' }
        );
      }
      if (mobileCardRef.current) {
        gsap.set(mobileCardRef.current, { clearProps: 'transform' });
      }
      selectOffset(direction);
    } else {
      resetDragTransforms();
    }
  };

  return (
    <section
      aria-label="Featured Showcase"
      className="relative space-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsFocusWithin(false);
        }
      }}
    >
      {/* Mobile Draggable Hero Card (< md) */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">
            Featured · Swipe to browse
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => selectOffset(-1)}
              aria-label="Previous featured song"
              className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-600 dark:bg-white/[0.06] dark:border-white/10 dark:text-gray-300 flex items-center justify-center active:scale-90 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => selectOffset(1)}
              aria-label="Next featured song"
              className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-600 dark:bg-white/[0.06] dark:border-white/10 dark:text-gray-300 flex items-center justify-center active:scale-90 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={mobileCardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          style={{ touchAction: 'pan-y' }}
          className={`relative w-full h-[205px] rounded-2xl overflow-hidden p-4 flex flex-col justify-between shadow-xl border border-slate-200/80 dark:border-white/10 select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <AlbumArt
            song={activeSong}
            isPlaying={isCurrentActive && isPlaying}
            size="fill"
            className="!rounded-2xl !absolute !inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#198f85]/90 text-white">
              {activeSong.genre}
            </span>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onAddToPlaylist(activeSong)}
              aria-label={`Add ${activeSong.title} to playlist`}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center active:scale-90 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white tracking-tight truncate">
                {activeSong.title}
              </h3>
              <p className="text-xs text-gray-200 truncate">
                {activeSong.artist} · {formatDuration(activeSong.duration)}
              </p>
            </div>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onPlay(activeSong)}
              aria-label={
                isCurrentActive && isPlaying
                  ? `Pause ${activeSong.title}`
                  : `Play ${activeSong.title}`
              }
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-[#198f85] backdrop-blur-md border border-white/35 text-white flex items-center justify-center transition active:scale-90 shrink-0"
            >
              {isCurrentActive && isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop / Tablet Draggable 5-Card Overlapping Fan Carousel (>= md) */}
      <div
        ref={stageRef}
        className="hidden md:flex items-center justify-between gap-2 relative py-0.5 select-none w-full mx-auto"
      >
        <button
          type="button"
          onClick={() => selectOffset(-1)}
          aria-label="Previous featured song"
          className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 dark:bg-[#15171c] dark:hover:bg-white/15 dark:border-white/10 dark:text-gray-300 dark:hover:text-white flex items-center justify-center transition active:scale-90 shrink-0 z-40 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          style={{ perspective: '1000px', touchAction: 'pan-y' }}
          title="Drag horizontally or click cards to browse"
          className={`flex-1 min-w-0 flex items-center justify-center overflow-hidden py-1 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {farLeft && (
            <button
              type="button"
              onClick={() => {
                if (!dragStateRef.current.moved) selectOffset(-2);
              }}
              aria-label={`Focus ${farLeft.title}`}
              className="showcase-flank showcase-far hidden lg:block relative w-[144px] xl:w-[196px] 2xl:w-[228px] h-[112px] xl:h-[142px] 2xl:h-[156px] -mr-[60px] xl:-mr-[74px] z-10 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 brightness-[0.65] hover:brightness-95 transition-all duration-300 hover:-translate-x-1 shrink-0 shadow-lg"
            >
              <AlbumArt song={farLeft} size="fill" className="!rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </button>
          )}

          {nearLeft && (
            <button
              type="button"
              onClick={() => {
                if (!dragStateRef.current.moved) selectOffset(-1);
              }}
              aria-label={`Focus ${nearLeft.title}`}
              className="showcase-flank showcase-near relative w-[196px] lg:w-[208px] xl:w-[264px] 2xl:w-[300px] h-[136px] lg:h-[148px] xl:h-[176px] 2xl:h-[192px] -mr-[64px] xl:-mr-[84px] z-20 rounded-2xl overflow-hidden border border-black/10 dark:border-white/15 brightness-[0.82] hover:brightness-100 transition-all duration-300 hover:-translate-y-1 shrink-0 shadow-xl"
            >
              <AlbumArt song={nearLeft} size="fill" className="!rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            </button>
          )}

          {/* Active Center Landscape Rectangle Card */}
          <div className="showcase-center relative w-[290px] lg:w-[316px] xl:w-[400px] 2xl:w-[460px] h-[168px] lg:h-[184px] xl:h-[214px] 2xl:h-[236px] z-30 rounded-2xl overflow-hidden border border-white/30 dark:border-white/20 shadow-[0_20px_50px_rgba(15,23,42,0.28)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.85)] shrink-0 group">
            <AlbumArt
              song={activeSong}
              isPlaying={isCurrentActive && isPlaying}
              size="fill"
              className="!rounded-2xl pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/15 pointer-events-none" />

            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onAddToPlaylist(activeSong)}
              aria-label={`Add ${activeSong.title} to playlist`}
              title="Add to playlist"
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/45 hover:bg-[#198f85] backdrop-blur-md border border-white/25 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>

            <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3">
              <div className="min-w-0 text-left pointer-events-none">
                <h3 className="text-lg font-bold text-white tracking-tight truncate drop-shadow">
                  {activeSong.title}
                </h3>
                <p className="text-xs text-gray-200 truncate">{activeSong.artist}</p>
              </div>

              <button
                ref={playBtnRef}
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => {
                  if (playBtnRef.current) animateMicroPop(playBtnRef.current);
                  onPlay(activeSong);
                }}
                aria-label={
                  isCurrentActive && isPlaying
                    ? `Pause ${activeSong.title}`
                    : `Play ${activeSong.title}`
                }
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-[#198f85] backdrop-blur-md border border-white/40 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-90 shrink-0 shadow-lg"
              >
                {isCurrentActive && isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {nearRight && (
            <button
              type="button"
              onClick={() => {
                if (!dragStateRef.current.moved) selectOffset(1);
              }}
              aria-label={`Focus ${nearRight.title}`}
              className="showcase-flank showcase-near relative w-[196px] lg:w-[208px] xl:w-[264px] 2xl:w-[300px] h-[136px] lg:h-[148px] xl:h-[176px] 2xl:h-[192px] -ml-[64px] xl:-ml-[84px] z-20 rounded-2xl overflow-hidden border border-black/10 dark:border-white/15 brightness-[0.82] hover:brightness-100 transition-all duration-300 hover:-translate-y-1 shrink-0 shadow-xl"
            >
              <AlbumArt song={nearRight} size="fill" className="!rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            </button>
          )}

          {farRight && (
            <button
              type="button"
              onClick={() => {
                if (!dragStateRef.current.moved) selectOffset(2);
              }}
              aria-label={`Focus ${farRight.title}`}
              className="showcase-flank showcase-far hidden lg:block relative w-[144px] xl:w-[196px] 2xl:w-[228px] h-[112px] xl:h-[142px] 2xl:h-[156px] -ml-[60px] xl:-ml-[74px] z-10 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 brightness-[0.65] hover:brightness-95 transition-all duration-300 hover:translate-x-1 shrink-0 shadow-lg"
            >
              <AlbumArt song={farRight} size="fill" className="!rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => selectOffset(1)}
          aria-label="Next featured song"
          className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 dark:bg-[#15171c] dark:hover:bg-white/15 dark:border-white/10 dark:text-gray-300 dark:hover:text-white flex items-center justify-center transition active:scale-90 shrink-0 z-40 shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle Drag / Pagination Indicator Dots */}
      <div className="flex items-center justify-center gap-1.5">
        {featured.map((item, idx) => {
          const active = idx === safeIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSlideDirection(idx > safeIndex ? 1 : -1);
                setActiveIndex(idx);
              }}
              aria-label={`Select ${item.title}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                active
                  ? 'w-5 bg-[#198f85]'
                  : 'w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-white/20 dark:hover:bg-white/40'
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}
