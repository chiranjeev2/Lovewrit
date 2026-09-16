"use client";

import React from "react";
import Link from "next/link";
import { Heart, Sparkles, Shield, Layers } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-rose-900/20 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 shadow-md shadow-rose-500/20 transition group-hover:scale-105">
            <Heart className="h-5 w-5 fill-white text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-rose-200 transition">
              Lovewrit
            </span>
            <span className="text-[10px] tracking-wider uppercase text-rose-300/80 font-medium">
              Occasions & Keepsakes
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          <Link
            href="/#services"
            className="inline-flex items-center text-xs font-medium text-neutral-300 hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-neutral-800/50"
          >
            <Layers className="mr-1.5 h-3.5 w-3.5 text-rose-400" />
            <span>Services</span>
          </Link>

          <Link
            href="/#templates"
            className="inline-flex items-center text-xs font-medium text-neutral-300 hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-neutral-800/50"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
            <span>Templates</span>
          </Link>

          <Link
            href="/#pricing"
            className="inline-flex items-center text-xs font-medium text-neutral-300 hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-neutral-800/50"
          >
            <span>Pricing</span>
          </Link>

          {/* Founder Admin Access link */}
          <Link
            href="/admin"
            className="flex items-center justify-center p-1.5 text-neutral-500 hover:text-rose-400 transition rounded-lg hover:bg-neutral-900 ml-1"
            title="Founder Admin Portal"
          >
            <Shield className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
