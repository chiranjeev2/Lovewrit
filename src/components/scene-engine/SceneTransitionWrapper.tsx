"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SceneTransitionWrapperProps {
  sceneKey: string;
  direction: number; // 1 for forward, -1 for backward
  prefersReducedMotion: boolean;
  children: React.ReactNode;
}

export function SceneTransitionWrapper({
  sceneKey,
  direction,
  prefersReducedMotion,
  children,
}: SceneTransitionWrapperProps) {
  if (prefersReducedMotion) {
    return <div className="w-full h-full">{children}</div>;
  }

  const variants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
    exit: (dir: number) => ({
      y: dir > 0 ? -40 : 40,
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={sceneKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        className="w-full h-full flex flex-col items-center justify-center overflow-hidden"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
