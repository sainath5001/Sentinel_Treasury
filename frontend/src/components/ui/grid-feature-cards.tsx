"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import React from "react";

export type FeatureType = {
  title: string;
  icon: LucideIcon;
  description: string;
  t3?: boolean;
};

type FeatureCardProps = React.ComponentProps<"div"> & {
  feature: FeatureType;
  patternIndex?: number;
};

export function FeatureCard({ feature, patternIndex = 0, className, ...props }: FeatureCardProps) {
  const pattern = React.useMemo(() => genPatternFromIndex(patternIndex), [patternIndex]);
  const Icon = feature.icon;

  return (
    <div className={cn("relative overflow-hidden p-6", className)} {...props}>
      <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-400/5 to-violet-400/[0.02] opacity-100 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
          <GridPattern
            width={20}
            height={20}
            x="-12"
            y="4"
            squares={pattern}
            className="absolute inset-0 h-full w-full fill-violet-400/5 stroke-violet-400/20 mix-blend-overlay"
          />
        </div>
      </div>
      <div className="relative z-10 flex items-center gap-2">
        <Icon className="size-6 text-violet-300/90" strokeWidth={1.25} aria-hidden />
        {feature.t3 && (
          <span className="rounded border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-medium text-violet-300">
            T3
          </span>
        )}
      </div>
      <h3 className="relative z-10 mt-8 text-sm font-medium text-slate-100 md:text-base">
        {feature.title}
      </h3>
      <p className="relative z-20 mt-2 text-xs font-light leading-relaxed text-slate-500 md:text-sm">
        {feature.description}
      </p>
    </div>
  );
}

function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  className,
  ...props
}: React.ComponentProps<"svg"> & {
  width: number;
  height: number;
  x: string;
  y: string;
  squares?: number[][];
}) {
  const patternId = React.useId();

  return (
    <svg aria-hidden="true" className={className} {...props}>
      <defs>
        <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([sx, sy], index) => (
            <rect
              strokeWidth="0"
              key={index}
              width={width + 1}
              height={height + 1}
              x={sx * width}
              y={sy * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}

function genPatternFromIndex(index: number, length = 5): number[][] {
  return Array.from({ length }, (_, i) => [
    ((index * 7 + i * 3) % 4) + 7,
    ((index * 5 + i * 2) % 6) + 1,
  ]);
}
