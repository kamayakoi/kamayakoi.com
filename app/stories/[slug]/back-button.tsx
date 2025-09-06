"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function BackButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href="/stories"
      className="text-zinc-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary transition-colors inline-flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        {!isHovered ? (
          <motion.span
            key="back-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            Back
          </motion.span>
        ) : (
          <motion.span
            key="back-arrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            ←
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
