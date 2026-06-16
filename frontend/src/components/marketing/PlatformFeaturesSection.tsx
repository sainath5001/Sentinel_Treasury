"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FeatureCard } from "@/components/ui/grid-feature-cards";
import { Button } from "@/components/ui/button";
import { PLATFORM_FEATURES } from "@/content/features";

const features = PLATFORM_FEATURES.slice(0, 6);

export function PlatformFeaturesSection() {
  return (
    <section className="border-t border-violet-500/10 bg-black py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 lg:px-8">
        <AnimatedContainer className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl md:text-4xl">
              Built for enterprise control
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400 md:text-base">
              AI speed without sacrificing security or auditability
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="border-slate-600 bg-black/50 text-slate-100 backdrop-blur-sm hover:bg-slate-900"
          >
            <Link href="/features">All features →</Link>
          </Button>
        </AnimatedContainer>

        <AnimatedContainer
          delay={0.2}
          className="grid grid-cols-1 divide-x divide-y divide-dashed divide-violet-500/15 border border-dashed border-violet-500/20 sm:grid-cols-2 md:grid-cols-3"
        >
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} patternIndex={i} />
          ))}
        </AnimatedContainer>
      </div>
    </section>
  );
}

type AnimatedContainerProps = {
  delay?: number;
  className?: string;
  children: React.ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: AnimatedContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
