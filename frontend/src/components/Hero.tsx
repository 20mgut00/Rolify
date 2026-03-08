import React, { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import {
  Wand2,
  Users,
  Download,
  GripHorizontal,
  BookOpen,
  Share2,
} from 'lucide-react';
import { characterAPI } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getAvatarUrl } from '../utils/avatarUrl';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut', delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ---------------------------------------------------------------------------
// Skeleton card (shown while carousel loads)
// ---------------------------------------------------------------------------
function CarouselSkeleton() {
  return (
    <div className="relative min-h-64 sm:min-h-96 md:min-h-125 flex flex-nowrap gap-4 sm:gap-6 overflow-hidden px-4 sm:px-6 md:px-10 items-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 sm:gap-8 shrink-0 min-w-56 sm:min-w-80 md:min-w-96 border-r border-accent-gold/30 pr-4 sm:pr-6 md:pr-10 animate-pulse"
        >
          <div className="shrink-0 w-24 h-24 sm:w-40 sm:h-40 md:w-64 md:h-64 rounded-full bg-accent-gold/10" />
          <div className="flex-1 space-y-3">
            <div className="h-6 sm:h-8 bg-accent-gold/10 rounded w-3/4" />
            <div className="h-4 bg-accent-gold/10 rounded w-1/2" />
            <div className="h-3 bg-accent-gold/10 rounded w-1/3" />
            <div className="h-8 bg-accent-gold/10 rounded w-28 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Hero() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t('hero.pageTitle'));

  const shouldReduceMotion = useReducedMotion();

  // Carousel refs & state
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const accRef = useRef(0);
  const pausedRef = useRef(false);
  const dragThreshold = 6;
  const [hasInteracted, setHasInteracted] = useState(false);

  // InView refs for sections
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' });
  const stepsInView = useInView(stepsRef, { once: true, margin: '-80px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' });

  const { data: publicCharacters, isLoading } = useQuery({
    queryKey: ['heroCharacters'],
    queryFn: () => characterAPI.getPublicCharacters(0, 10),
  });

  const characters = publicCharacters?.content || [];
  const totalCharacters = publicCharacters?.totalElements ?? 0;

  // ---------------------------------------------------------------------------
  // Auto-scroll
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container || characters.length === 0) return;

    accRef.current = container.scrollLeft;
    let rafId: number;
    const speedPerSecond = 30;
    let last = performance.now();

    const step = (now: number) => {
      if (!container) return;
      const delta = now - last;
      last = now;

      if (pausedRef.current) {
        rafId = requestAnimationFrame(step);
        return;
      }

      accRef.current += (speedPerSecond * delta) / 1000;

      const half = container.scrollWidth / 2;
      if (accRef.current >= half) {
        accRef.current -= half;
      } else if (accRef.current < 0) {
        accRef.current += half;
      }

      container.scrollLeft = accRef.current;
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [characters]);

  // Keep accumulator in sync on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        const half = container.scrollWidth / 2 || 1;
        accRef.current = ((container.scrollLeft % half) + half) % half;
        container.scrollLeft = accRef.current;
      });
      ro.observe(container);
    }

    const onWindowResize = () => {
      const half = container.scrollWidth / 2 || 1;
      accRef.current = ((container.scrollLeft % half) + half) % half;
      container.scrollLeft = accRef.current;
    };

    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (ro) ro.disconnect();
    };
  }, [characters]);

  // ---------------------------------------------------------------------------
  // Pointer handlers
  // ---------------------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = container.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !isDraggingRef.current) return;

    const delta = e.clientX - startXRef.current;
    if (!hasDraggedRef.current && Math.abs(delta) < dragThreshold) return;

    if (!hasDraggedRef.current) {
      hasDraggedRef.current = true;
      pausedRef.current = true;
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
      setHasInteracted(true);
      try { container.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    }

    e.preventDefault();

    const half = container.scrollWidth / 2;
    let newScroll = startScrollLeftRef.current - delta;
    if (newScroll < 0) newScroll += half * Math.ceil(Math.abs(newScroll) / half);
    newScroll = ((newScroll % half) + half) % half;
    container.scrollLeft = newScroll;
    accRef.current = newScroll;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    isDraggingRef.current = false;
    pausedRef.current = false;
    if (hasDraggedRef.current) {
      try { container.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    }
    container.style.cursor = 'grab';
    container.style.userSelect = '';
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
    }
  };

  // Disable animations when user prefers reduced motion
  const motionProps = (delay = 0) =>
    shouldReduceMotion
      ? {}
      : { initial: 'hidden', animate: 'visible', variants: fadeUp, custom: delay };

  return (
    <div className="container mx-auto px-4 py-12 sm:py-24">

      {/* ------------------------------------------------------------------ */}
      {/* Hero Section                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="text-center mb-10 sm:mb-20">
        <motion.h1
          className="font-cinzel text-3xl sm:text-5xl md:text-6xl font-bold text-primary-dark mb-4 leading-tight"
          {...motionProps(0)}
        >
          {t('hero.title')}
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg md:text-2xl text-primary-dark/70 mb-6 max-w-3xl mx-auto"
          {...motionProps(0.12)}
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* Stats counter */}
        {totalCharacters > 0 && (
          <motion.div
            className="flex items-center justify-center gap-2 mb-8 text-accent-gold font-cinzel"
            {...motionProps(0.22)}
          >
            <Users size={18} />
            <span className="font-bold text-lg">{totalCharacters.toLocaleString()}</span>
            <span className="text-primary-dark/60 font-normal text-sm">
              {t('hero.communityStats')}
            </span>
          </motion.div>
        )}

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          {...motionProps(0.3)}
        >
          <RouterLink
            to="/create"
            className="bg-accent-gold text-primary-dark px-8 py-3 rounded-lg font-cinzel font-medium cursor-pointer transition-all duration-200 transform-gpu hover:bg-opacity-90 hover:scale-[1.02] hover:-translate-y-px hover:brightness-105 inline-flex items-center justify-center gap-2"
          >
            <Wand2 size={20} />
            {t('hero.createCharacter')}
          </RouterLink>
          <RouterLink
            to="/gallery"
            className="border-2 border-accent-gold text-accent-gold px-8 py-3 rounded-lg font-cinzel font-medium hover:bg-accent-gold hover:text-primary-dark transition inline-flex items-center justify-center gap-2"
          >
            <Users size={20} />
            {t('hero.browseGallery')}
          </RouterLink>
        </motion.div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Carousel                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-10 sm:mb-20">
        <motion.h2
          className="font-cinzel text-2xl sm:text-4xl font-bold text-center text-primary-dark mb-6 sm:mb-8"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {t('hero.featuredCharacters')}
        </motion.h2>

        <div className="relative bg-white rounded-lg shadow-lg overflow-hidden hero-shared-panel">
          <style>{`.hide-scrollbar::-webkit-scrollbar{display:none} .hide-scrollbar{-ms-overflow-style:none; scrollbar-width:none;}`}</style>

          {/* Skeleton */}
          {isLoading && <CarouselSkeleton />}

          {/* Empty state */}
          {!isLoading && characters.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-64 sm:min-h-96 gap-4 p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-accent-gold/10 flex items-center justify-center">
                <Users size={36} className="text-accent-gold/50" />
              </div>
              <h3 className="font-cinzel text-xl font-bold text-primary-dark">
                {t('hero.noCharactersYet')}
              </h3>
              <p className="text-primary-dark/60 text-sm max-w-sm">
                {t('hero.beFirst')}
              </p>
              <RouterLink
                to="/create"
                className="bg-accent-gold text-primary-dark px-6 py-2 rounded-lg font-cinzel font-medium text-sm hover:brightness-105 transition"
              >
                {t('hero.createCharacter')}
              </RouterLink>
            </div>
          )}

          {/* Carousel */}
          {!isLoading && characters.length > 0 && (
            <>
              {/* Drag hint */}
              <div
                className={`absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 text-primary-dark/40 text-xs font-cinzel select-none pointer-events-none transition-opacity duration-500 ${hasInteracted ? 'opacity-0' : 'opacity-100'}`}
              >
                <GripHorizontal size={14} />
                {t('hero.dragToExplore')}
                <GripHorizontal size={14} />
              </div>

              <div
                ref={containerRef}
                className="relative min-h-64 sm:min-h-96 md:min-h-125 flex flex-nowrap gap-4 sm:gap-6 overflow-auto hide-scrollbar"
                style={{ touchAction: 'pan-y', cursor: 'grab' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClickCapture={handleClickCapture}
              >
                {[...characters, ...characters].map((char, index) => (
                  <div
                    key={`${char.id}-${index}`}
                    className="p-4 sm:p-6 md:p-10 flex items-center justify-center shrink-0 min-w-56 sm:min-w-80 md:min-w-96 border-r border-accent-gold/30"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-8 w-full">
                      {/* Avatar */}
                      <div className="shrink-0">
                        {char.avatarImage ? (
                          <img
                            src={getAvatarUrl(char.avatarImage)}
                            alt={char.name}
                            className="w-24 h-24 sm:w-40 sm:h-40 md:w-64 md:h-64 border-accent-gold object-contain"
                          />
                        ) : (
                          <div className="w-20 h-20 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-full border-4 border-accent-gold shadow-lg bg-accent-gold/10 flex items-center justify-center">
                            <span className="font-cinzel text-3xl sm:text-4xl md:text-6xl font-bold text-accent-gold">
                              {char.name[0]}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="text-center md:text-left flex-1">
                        <h3 className="font-cinzel text-xl sm:text-3xl md:text-4xl font-bold text-primary-dark mb-1 sm:mb-2">
                          {char.name}
                        </h3>
                        <p className="text-accent-gold font-semibold mb-1 sm:mb-2 text-sm sm:text-lg">
                          {char.className} • {char.system}
                        </p>
                        <p className="text-primary-dark/70 mb-1 text-sm sm:text-base">{char.species}</p>
                        {char.creatorName && (
                          <p className="text-primary-dark/60 text-xs sm:text-sm mb-1 sm:mb-2">{`${t('common.by')} ${char.creatorName}`}</p>
                        )}
                        <p className="text-primary-dark/50 text-xs sm:text-sm mb-3 sm:mb-6">
                          {t('common.created')} {new Date(char.createdAt).toLocaleDateString(i18n.language)}
                        </p>
                        <RouterLink
                          to={`/character/${char.id}`}
                          className="bg-accent-gold text-primary-dark px-4 sm:px-6 py-2 rounded-lg font-cinzel font-medium text-sm sm:text-base cursor-pointer transition-all duration-200 transform-gpu hover:bg-opacity-90 hover:scale-[1.02] hover:-translate-y-px hover:brightness-105 inline-block"
                        >
                          {t('hero.viewCharacter')}
                        </RouterLink>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Features                                                             */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        ref={featuresRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-20"
        variants={staggerContainer}
        initial={shouldReduceMotion ? undefined : 'hidden'}
        animate={featuresInView && !shouldReduceMotion ? 'visible' : undefined}
      >
        <motion.div
          variants={cardVariant}
          className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl hover:scale-105 transition hero-shared-panel"
        >
          <div className="w-20 h-20 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Wand2 size={40} className="text-primary-dark" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-4">
            {t('hero.easyCreation')}
          </h3>
          <ul className="space-y-2 text-left">
            {(['easyCreationBullet1', 'easyCreationBullet2', 'easyCreationBullet3'] as const).map((key) => (
              <li key={key} className="flex items-start gap-2 text-primary-dark/70 text-sm">
                <span className="text-accent-gold font-bold mt-0.5 shrink-0">✓</span>
                {t(`hero.${key}`)}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          variants={cardVariant}
          className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl hover:scale-105 transition hero-shared-panel"
        >
          <div className="w-20 h-20 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 size={40} className="text-primary-dark" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-4">
            {t('hero.shareDiscover')}
          </h3>
          <ul className="space-y-2 text-left">
            {(['shareDiscoverBullet1', 'shareDiscoverBullet2', 'shareDiscoverBullet3'] as const).map((key) => (
              <li key={key} className="flex items-start gap-2 text-primary-dark/70 text-sm">
                <span className="text-accent-gold font-bold mt-0.5 shrink-0">✓</span>
                {t(`hero.${key}`)}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          variants={cardVariant}
          className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl hover:scale-105 transition hero-shared-panel"
        >
          <div className="w-20 h-20 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Download size={40} className="text-primary-dark" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-4">
            {t('hero.exportAnywhere')}
          </h3>
          <ul className="space-y-2 text-left">
            {(['exportAnywhereBullet1', 'exportAnywhereBullet2', 'exportAnywhereBullet3'] as const).map((key) => (
              <li key={key} className="flex items-start gap-2 text-primary-dark/70 text-sm">
                <span className="text-accent-gold font-bold mt-0.5 shrink-0">✓</span>
                {t(`hero.${key}`)}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* CTA Section — different actions from hero top to avoid duplication   */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        ref={ctaRef}
        className="bg-linear-to-r from-accent-gold/10 to-accent-gold/5 rounded-lg p-6 sm:p-12 text-center mb-10 sm:mb-20 border border-accent-gold/20"
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
        animate={ctaInView && !shouldReduceMotion ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-primary-dark mb-3">
          {t('hero.readyToBegin')}
        </h2>
        <p className="text-base sm:text-lg text-primary-dark/70 mb-6 sm:mb-8 max-w-2xl mx-auto">
          {t('hero.readyToBeginDesc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink
            to="/gallery"
            className="bg-accent-gold text-primary-dark px-8 py-3 rounded-lg font-cinzel font-medium cursor-pointer transition-all duration-200 transform-gpu hover:bg-opacity-90 hover:scale-[1.02] hover:-translate-y-px hover:brightness-105 inline-flex items-center justify-center gap-2"
          >
            <Users size={20} />
            {t('hero.exploreGallery')}
          </RouterLink>
          <RouterLink
            to="/library"
            className="border-2 border-accent-gold text-accent-gold px-8 py-3 rounded-lg font-cinzel font-medium hover:bg-accent-gold hover:text-primary-dark transition inline-flex items-center justify-center gap-2"
          >
            <BookOpen size={20} />
            {t('hero.viewMyLibrary')}
          </RouterLink>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* How It Works                                                         */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        ref={stepsRef}
        className="mb-8"
        initial={shouldReduceMotion ? undefined : 'hidden'}
        animate={stepsInView && !shouldReduceMotion ? 'visible' : undefined}
        variants={staggerContainer}
      >
        <motion.h2
          variants={cardVariant}
          className="font-cinzel text-2xl sm:text-4xl font-bold text-center text-primary-dark mb-8 sm:mb-12"
        >
          {t('hero.howItWorks')}
        </motion.h2>

        {/* Steps with connectors */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 items-start">

          {/* Step 1 */}
          <motion.div variants={cardVariant} className="text-center md:col-span-1 flex flex-col items-center">
            <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center mb-4 font-cinzel text-lg font-bold text-primary-dark shrink-0">
              1
            </div>
            <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-2">
              {t('hero.step1Title')}
            </h3>
            <p className="text-primary-dark/70 text-sm">{t('hero.step1Desc')}</p>
            {/* Mobile connector */}
            <div className="block md:hidden w-px h-8 border-l-2 border-dashed border-accent-gold/40 mt-4" />
          </motion.div>

          {/* Connector 1→2 (desktop) */}
          <div className="hidden md:flex items-start justify-center pt-6 col-span-1">
            <div className="w-full border-t-2 border-dashed border-accent-gold/40 mt-0" />
          </div>

          {/* Step 2 */}
          <motion.div variants={cardVariant} className="text-center md:col-span-1 flex flex-col items-center">
            <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center mb-4 font-cinzel text-lg font-bold text-primary-dark shrink-0">
              2
            </div>
            <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-2">
              {t('hero.step2Title')}
            </h3>
            <p className="text-primary-dark/70 text-sm">{t('hero.step2Desc')}</p>
            {/* Mobile connector */}
            <div className="block md:hidden w-px h-8 border-l-2 border-dashed border-accent-gold/40 mt-4" />
          </motion.div>

          {/* Connector 2→3 (desktop) */}
          <div className="hidden md:flex items-start justify-center pt-6 col-span-1">
            <div className="w-full border-t-2 border-dashed border-accent-gold/40 mt-0" />
          </div>

          {/* Step 3 */}
          <motion.div variants={cardVariant} className="text-center md:col-span-1 flex flex-col items-center">
            <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center mb-4 font-cinzel text-lg font-bold text-primary-dark shrink-0">
              3
            </div>
            <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-2">
              {t('hero.step3Title')}
            </h3>
            <p className="text-primary-dark/70 text-sm">{t('hero.step3Desc')}</p>
          </motion.div>

        </div>
      </motion.div>

    </div>
  );
}
