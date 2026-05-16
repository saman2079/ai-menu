// app/page.tsx
"use client";

import Button from "@/components/UI/Button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative w-full min-h-[100dvh] flex flex-col justify-center items-center p-4 text-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-4"
      >
        <h1 className="text-6xl md:text-7xl font-display font-bold text-white text-glow">
          Food Fusion
        </h1>
        <p className="text-lg md:text-xl text-light max-w-md leading-relaxed">
          Experience the future of dining. Chat with our AI chef and order your
          perfect meal.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute bottom-20 w-full px-8"
      >
        <Link href="/ai-menu">
            <Button
              variant="primary"
              className="w-full font-bold text-xl py-4 animate-subtle-glow"
            >
                Start Ordering
            </Button>
        </Link>
      </motion.div>
    </div>
  );
}
