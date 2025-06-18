"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [moveX, setMoveX] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (containerRef.current && knobRef.current) {
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const knobWidth = knobRef.current.getBoundingClientRect().width;
      const offset = containerWidth - knobWidth - 8; // uwzględnij padding (2x p-1 = 8px)
      setMoveX(offset);
    }
  }, [mounted]);

  if (!mounted) return (
    <div className="w-16 h-9 bg-gray-300 rounded-lg p-1" />
  );

  return (
    <motion.div
      ref={containerRef}
      className="w-16 h-9 bg-gray-300 dark:bg-gray-600 rounded-lg p-1 cursor-pointer flex items-center"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      animate={{
        backgroundColor: resolvedTheme === "dark" ? "rgb(75, 85, 99)" : "rgb(209, 213, 219)"
      }}
    >
      <motion.div
        ref={knobRef}
        className="w-6 h-6 rounded-lg flex items-center justify-center"
        animate={{
          x: resolvedTheme === "dark" ? moveX : 0,
          backgroundColor: resolvedTheme === "dark" ? "rgb(31, 41, 55)" : "rgb(253, 224, 71)"
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30
        }}
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-gray-200" />
        ) : (
          <Sun className="w-4 h-4 text-yellow-600" />
        )}
      </motion.div>
    </motion.div>
  );
}
