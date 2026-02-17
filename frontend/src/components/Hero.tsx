import React, { useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Wand2,
  Users,
  Download,
} from 'lucide-react';
import { characterAPI } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getAvatarUrl } from '../utils/avatarUrl';

export default function Hero() {
  // React 19 feature: Dynamic document title
  useDocumentTitle('RPG Character Creator - Create Your Adventure');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const accRef = useRef(0);
  const pausedRef = useRef(false);
  const dragThreshold = 6;

  const { data: publicCharacters, isLoading } = useQuery({
    queryKey: ['heroCharacters'],
    queryFn: () => characterAPI.getPublicCharacters(0, 10),
  });

  const characters = publicCharacters?.content || [];

  // Continuous auto-scroll to the right. We duplicate the items to create an infinite loop.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || characters.length === 0) return;

    accRef.current = container.scrollLeft;
    let rafId: number;

    // Use time-based motion (pixels per second) instead of pixels per frame.
    // This avoids rounding/round-trip issues when adding very small fractional
    // values per frame and makes the scroll consistent across different
    // refresh rates.
    const speedPerSecond = 30; // pixels per second (tweak for faster/slower)

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
      // wrap in both directions so negative values also loop
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

  // Keep accumulator synchronized if the container size/content changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ResizeObserver keeps us in sync if images load or layout changes.
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

  // Pointer handlers to allow drag-to-scroll. While dragging we pause auto-scroll
  // and update the accumulator so motion resumes smoothly after release.
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

    if (!hasDraggedRef.current && Math.abs(delta) < dragThreshold) {
      return;
    }

    if (!hasDraggedRef.current) {
      hasDraggedRef.current = true;
      pausedRef.current = true;
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
      try {
        container.setPointerCapture(e.pointerId);
      } catch (err) {
        // ignore if unsupported
      }
    }

    e.preventDefault(); // prevent text selection while dragging

    const half = container.scrollWidth / 2;

    // compute new scroll position based on drag. We keep positions normalized
    // to [0, half) so wrapping both directions is seamless and avoids DOM
    // clamping to 0 when dragging left.
    let newScroll = startScrollLeftRef.current - delta;
    if (newScroll < 0) newScroll += half * Math.ceil(Math.abs(newScroll) / half);
    // keep in [0, half)
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
      try {
        container.releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }

    // restore defaults
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

  return (
    <div className="container mx-auto px-4 py-24">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h1 className="font-cinzel text-5xl md:text-6xl font-bold text-primary-dark mb-4 leading-tight">
          Create Your Legend
        </h1>
        <p className="text-lg md:text-2xl text-primary-dark/70 mb-8 max-w-3xl mx-auto">
          Bring your tabletop RPG characters to life with our intuitive character creator.
          Start with Root RPG and expand your adventures.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink
            to="/create"
            className="bg-accent-gold text-primary-dark px-8 py-3 rounded-lg font-cinzel font-medium cursor-pointer transition-all duration-200 transform-gpu hover:bg-opacity-90 hover:scale-[1.02] hover:-translate-y-px hover:brightness-105 inline-flex items-center justify-center gap-2"
          >
            <Wand2 size={20} />
            Create Character
          </RouterLink>
          <RouterLink
            to="/gallery"
            className="border-2 border-accent-gold text-accent-gold px-8 py-3 rounded-lg font-cinzel font-medium hover:bg-accent-gold hover:text-primary-dark transition inline-flex items-center justify-center gap-2"
          >
            <Users size={20} />
            Browse Gallery
          </RouterLink>
        </div>
      </div>

      {/* Carousel */}
      {!isLoading && characters.length > 0 && (
        <div className="mb-20">
          <h2 className="font-cinzel text-4xl font-bold text-center text-primary-dark mb-8">
            Featured Characters
          </h2>
          <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Hide native scrollbars and provide a scrolling container we control */}
            <style>{`.hide-scrollbar::-webkit-scrollbar{display:none} .hide-scrollbar{-ms-overflow-style:none; scrollbar-width:none;}`}</style>
            <div
              ref={containerRef}
              className="relative min-h-96 md:min-h-125 flex flex-nowrap gap-6 overflow-auto hide-scrollbar"
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
                  className="p-6 md:p-10 flex items-center justify-center shrink-0 min-w-72 sm:min-w-80 md:min-w-96 border-r"
                >
                  <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                    {/* Avatar */}
                    <div className="shrink-0">
                      {char.avatarImage ? (
                        <img
                          src={getAvatarUrl(char.avatarImage)}
                          alt={char.name}
                          className="w-32 h-32 md:w-80 md:h-80 border-accent-gold object-contain"
                        />
                      ) : (
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-accent-gold shadow-lg bg-accent-gold/10 flex items-center justify-center">
                          <span className="font-cinzel text-4xl md:text-6xl font-bold text-accent-gold">
                            {char.name[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="text-center md:text-left flex-1">
                      <h3 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-dark mb-2">
                        {char.name}
                      </h3>
                      <p className="text-accent-gold font-semibold mb-2 text-lg">
                        {char.className} • {char.system}
                      </p>
                      <p className="text-primary-dark/70 mb-1">{char.species}</p>
                      {char.creatorName && (
                        <p className="text-primary-dark/60 text-sm mb-2">By {char.creatorName}</p>
                      )}
                      <p className="text-primary-dark/50 text-sm mb-6">
                        Created {new Date(char.createdAt).toLocaleDateString()}
                      </p>
                      <RouterLink
                        to={`/character/${char.id}`}
                        className="bg-accent-gold text-primary-dark px-6 py-2 rounded-lg font-cinzel font-medium cursor-pointer transition-all duration-200 transform-gpu hover:bg-opacity-90 hover:scale-[1.02] hover:-translate-y-px hover:brightness-105 inline-block"
                      >
                        View Character
                      </RouterLink>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation removed: carousel auto-scrolls; controls/dots intentionally omitted */}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {/* Feature 1 */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl hover:scale-105 transition">
          <div className="w-20 h-20 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Wand2 size={40} className="text-primary-dark" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-3">
            Easy Creation
          </h3>
          <p className="text-primary-dark/70">
            Intuitive step-by-step forms with real-time validation guide you through character creation. No rules knowledge required!
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl hover:scale-105 transition">
          <div className="w-20 h-20 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={40} className="text-primary-dark" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-3">
            Share & Discover
          </h3>
          <p className="text-primary-dark/70">
            Make your characters public and explore amazing creations from the community. Get inspired by others!
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl hover:scale-105 transition">
          <div className="w-20 h-20 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Download size={40} className="text-primary-dark" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-3">
            Export Anywhere
          </h3>
          <p className="text-primary-dark/70">
            Download your characters as beautiful PDFs for printing, or JSON/CSV for importing into other tools.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-linear-to-r from-accent-gold/10 to-accent-gold/5 rounded-lg p-12 text-center mb-20 border border-accent-gold/20">
        <h2 className="font-cinzel text-4xl font-bold text-primary-dark mb-3">
          Ready to Begin Your Adventure?
        </h2>
        <p className="text-lg text-primary-dark/70 mb-8 max-w-2xl mx-auto">
          Join thousands of players creating memorable characters for their campaigns.
          Sign up now to save your characters and access all features!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink
            to="/create"
            className="bg-accent-gold text-primary-dark px-8 py-3 rounded-lg font-cinzel font-medium cursor-pointer transition-all duration-200 transform-gpu hover:bg-opacity-90 hover:scale-[1.02] hover:-translate-y-px hover:brightness-105"
          >
            Start Creating
          </RouterLink>
          <RouterLink
            to="/library"
            className="border-2 border-accent-gold text-accent-gold px-8 py-3 rounded-lg font-cinzel font-medium hover:bg-accent-gold hover:text-primary-dark transition"
          >
            View My Library
          </RouterLink>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-8">
        <h2 className="font-cinzel text-4xl font-bold text-center text-primary-dark mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4 font-cinzel text-lg font-bold text-primary-dark">
              1
            </div>
            <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-2">
              Choose Your Class
            </h3>
            <p className="text-primary-dark/70 text-sm">
              Select from Adventurer, Arbiter, Ranger, and more. Each class has unique abilities and playstyles.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4 font-cinzel text-lg font-bold text-primary-dark">
              2
            </div>
            <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-2">
              Build Your Character
            </h3>
            <p className="text-primary-dark/70 text-sm">
              Fill in stats, background, moves, and equipment. Our system validates everything automatically.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4 font-cinzel text-lg font-bold text-primary-dark">
              3
            </div>
            <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-2">
              Play & Share
            </h3>
            <p className="text-primary-dark/70 text-sm">
              Export your character sheet or share it with the community. Update it as your character grows!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
