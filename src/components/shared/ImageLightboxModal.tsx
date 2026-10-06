"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

export interface LightboxPhoto {
  src: string;
  alt?: string;
  caption?: string;
}

interface ImageLightboxModalProps {
  isOpen: boolean;
  photos: (string | LightboxPhoto)[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageLightboxModal({
  isOpen,
  photos,
  initialIndex = 0,
  onClose,
}: ImageLightboxModalProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Touch tracking for swipe and pinch
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pinchStartDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  const lastTapRef = useRef<number>(0);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Normalize photos list
  const normalizedPhotos: LightboxPhoto[] = React.useMemo(() => {
    return photos
      .map((p, idx) => {
        if (typeof p === "string") {
          return { src: p, alt: `Photo ${idx + 1}` };
        }
        return {
          src: p.src,
          alt: p.alt || `Photo ${idx + 1}`,
          caption: p.caption,
        };
      })
      .filter((p) => Boolean(p.src && p.src.trim().length > 0));
  }, [photos]);

  const total = normalizedPhotos.length;

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setCurrentIndex(Math.max(0, Math.min(initialIndex, total - 1)));
        setScale(1);
        setPan({ x: 0, y: 0 });
      }, 0);
      previousActiveElement.current = document.activeElement as HTMLElement | null;

      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, initialIndex, total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [total]);

  const handleResetZoom = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 3.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Double tap to zoom
  const handleDoubleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      setScale((prev) => {
        if (prev > 1.2) {
          setPan({ x: 0, y: 0 });
          return 1;
        } else {
          return 2.5;
        }
      });
    },
    []
  );

  // Keyboard navigation & Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disallow bubbling to underlying scene engine
      e.stopPropagation();

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Tab") {
        // Focus trap
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Touch handlers for swipe, pinch-to-zoom, and double-tap
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 2) {
      // Pinch start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      initialScaleRef.current = scale;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap
        handleDoubleTap(e);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: now,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      // Pinch zooming
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / pinchStartDistRef.current;
      const newScale = Math.min(Math.max(initialScaleRef.current * ratio, 1), 3.5);
      setScale(newScale);
      if (newScale === 1) setPan({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && scale > 1 && touchStartRef.current) {
      // Pan when zoomed
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      setPan((prev) => ({ x: prev.x + dx * 0.4, y: prev.y + dy * 0.4 }));
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    pinchStartDistRef.current = null;

    if (scale <= 1.05 && touchStartRef.current && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;

      // Detect horizontal swipe if delta X > 45px and mostly horizontal
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 400) {
        if (dx < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    touchStartRef.current = null;
  };

  if (!mounted || !isOpen || total === 0) return null;

  const currentPhoto = normalizedPhotos[currentIndex] || normalizedPhotos[0];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            // Click outside to close (unless clicking on controls or image)
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-[99999] flex flex-col justify-between bg-black/95 backdrop-blur-xl p-3 sm:p-6 select-none touch-none"
        >
          {/* Top Control Bar */}
          <div className="relative z-20 flex items-center justify-between w-full max-w-4xl mx-auto py-1">
            {/* Counter */}
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-mono font-medium text-white/90 border border-white/10">
                {currentIndex + 1} / {total}
              </span>
              {scale > 1 && (
                <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-mono text-rose-300 border border-rose-500/30">
                  {Math.round(scale * 100)}%
                </span>
              )}
            </div>

            {/* Zoom & Close Controls */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleZoomOut}
                disabled={scale <= 1}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition disabled:opacity-30 cursor-pointer"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {scale > 1 && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
                  title="Reset zoom"
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white transition shadow-lg cursor-pointer ml-1"
                title="Close viewer (Esc)"
                aria-label="Close photo preview"
                autoFocus
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Photo Viewport */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden w-full max-w-5xl mx-auto my-auto">
            {/* Previous Button */}
            {total > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 sm:left-4 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/15 transition shadow-2xl active:scale-95 cursor-pointer"
                title="Previous photo"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Photo Container */}
            <motion.div
              key={currentPhoto.src}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              onDoubleClick={handleDoubleTap}
              className="relative max-h-full max-w-full flex items-center justify-center cursor-zoom-in"
              style={{
                transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
                transition: scale === 1 ? "transform 0.2s ease-out" : "none",
              }}
            >
              <Image
                src={currentPhoto.src}
                alt={currentPhoto.alt || "Keepsake memory photo"}
                width={1200}
                height={800}
                unoptimized
                className="max-h-[75vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10"
                draggable={false}
              />
            </motion.div>

            {/* Next Button */}
            {total > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 sm:right-4 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/15 transition shadow-2xl active:scale-95 cursor-pointer"
                title="Next photo"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          {/* Caption & Instructions Footer */}
          <div className="relative z-20 w-full max-w-2xl mx-auto text-center py-2 space-y-1">
            {currentPhoto.caption && (
              <p className="text-xs sm:text-sm font-serif italic text-white/90 drop-shadow-md">
                &ldquo;{currentPhoto.caption}&rdquo;
              </p>
            )}
            <div className="flex items-center justify-center space-x-3 text-[10px] text-neutral-400">
              <span>Double-tap or pinch to zoom</span>
              {total > 1 && <span>• Swipe or arrow keys to browse</span>}
              <span>• Esc to close</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
