"use client";

import { useState } from "react";
import type { JSX, ComponentProps } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Transform {
  x: number;
  y: number;
  rotationZ: number;
}

const transforms: Transform[] = [
  { x: -0.8, y: -0.6, rotationZ: -29 },
  { x: -0.2, y: -0.4, rotationZ: -6 },
  { x: -0.05, y: 0.1, rotationZ: 12 },
  { x: -0.05, y: -0.1, rotationZ: -9 },
  { x: -0.1, y: 0.55, rotationZ: 3 },
  { x: 0, y: -0.1, rotationZ: 9 },
  { x: 0, y: 0.15, rotationZ: -12 },
  { x: 0, y: 0.15, rotationZ: -17 },
  { x: 0, y: -0.65, rotationZ: 9 },
  { x: 0.1, y: 0.4, rotationZ: 12 },
  { x: 0, y: -0.15, rotationZ: -9 },
  { x: 0.2, y: 0.15, rotationZ: 12 },
  { x: 0.8, y: 0.6, rotationZ: 20 },
];

type TextDisperseProps = ComponentProps<"div"> & {
  /** children should be string (max 13 chars) */
  children: string;
  onHover?: (isActive: boolean) => void;
};

export function TextDisperse({
  children,
  onHover,
  className,
  ...props
}: Omit<TextDisperseProps, "onMouseEnter" | "onMouseLeave">) {
  const [isAnimated, setIsAnimated] = useState(false);

  const splitWord = (word: string) => {
    const chars: JSX.Element[] = [];
    word.split("").forEach((char, i) => {
      const transform = transforms[i] ?? transforms[transforms.length - 1];
      chars.push(
        <motion.span
          custom={i}
          variants={{
            open: {
              x: transform.x + "em",
              y: transform.y + "em",
              rotateZ: transform.rotationZ,
              transition: { duration: 0.75, ease: [0.33, 1, 0.68, 1] },
              zIndex: 1,
            },
            closed: {
              x: 0,
              y: 0,
              rotateZ: 0,
              transition: { duration: 0.75, ease: [0.33, 1, 0.68, 1] },
              zIndex: 0,
            },
          }}
          animate={isAnimated ? "open" : "closed"}
          key={char + i}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>,
      );
    });
    return chars;
  };

  const manageMouseEnter = () => {
    onHover?.(true);
    setIsAnimated(true);
  };

  const manageMouseLeave = () => {
    onHover?.(false);
    setIsAnimated(false);
  };

  return (
    <div
      className={cn(
        "relative inline-flex cursor-pointer flex-row flex-nowrap items-center justify-center font-bold tracking-tight",
        className,
      )}
      onMouseEnter={manageMouseEnter}
      onMouseLeave={manageMouseLeave}
      {...props}
    >
      {splitWord(children)}
    </div>
  );
}
