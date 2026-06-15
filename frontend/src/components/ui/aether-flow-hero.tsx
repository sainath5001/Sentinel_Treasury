"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Fingerprint, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Particle {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  size: number;
  color: string;
  draw: () => void;
  update: () => void;
}

export function AetherFlowHero() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasEl = canvas;
    if (!canvasEl) return;

    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = { x: null as number | null, y: null as number | null, radius: 200 };

    class ParticleImpl implements Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;

      constructor(
        x: number,
        y: number,
        directionX: number,
        directionY: number,
        size: number,
        color: string,
      ) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx!.fillStyle = this.color;
        ctx!.fill();
      }

      update() {
        if (this.x > canvasEl.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvasEl.height || this.y < 0) this.directionY = -this.directionY;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius + this.size) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= forceDirectionX * force * 5;
            this.y -= forceDirectionY * force * 5;
          }
        }

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    function init() {
      particles = [];
      const numberOfParticles = (canvasEl.height * canvasEl.width) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * (canvasEl.width - size * 4) + size * 2;
        const y = Math.random() * (canvasEl.height - size * 4) + size * 2;
        const directionX = Math.random() * 0.4 - 0.2;
        const directionY = Math.random() * 0.4 - 0.2;
        const color = "rgba(34, 211, 238, 0.75)";
        particles.push(new ParticleImpl(x, y, directionX, directionY, size, color));
      }
    }

    const resizeCanvas = () => {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
      init();
    };

    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const distance =
            (particles[a].x - particles[b].x) * (particles[a].x - particles[b].x) +
            (particles[a].y - particles[b].y) * (particles[a].y - particles[b].y);

          if (distance < (canvasEl.width / 7) * (canvasEl.height / 7)) {
            let opacityValue = 1 - distance / 20000;

            if (mouse.x !== null && mouse.y !== null) {
              const dxMouseA = particles[a].x - mouse.x;
              const dyMouseA = particles[a].y - mouse.y;
              const distanceMouseA = Math.sqrt(dxMouseA * dxMouseA + dyMouseA * dyMouseA);
              ctx.strokeStyle =
                distanceMouseA < mouse.radius
                  ? `rgba(255, 255, 255, ${opacityValue})`
                  : `rgba(34, 211, 238, ${opacityValue * 0.6})`;
            } else {
              ctx.strokeStyle = `rgba(34, 211, 238, ${opacityValue * 0.5})`;
            }

            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.fillStyle = "#070b14";
      ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
      for (let i = 0; i < particles.length; i++) particles[i].update();
      connect();
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2 + 0.5,
        duration: 0.8,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <div className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.06)_0%,_transparent_70%)]" />

      <div className="relative z-10 px-6 text-center">
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-sm"
        >
          <Fingerprint className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-medium text-slate-200">
            Powered by Terminal 3 Agent Identity
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 bg-gradient-to-b from-slate-50 to-slate-400 bg-clip-text text-5xl font-bold tracking-tighter text-transparent md:text-7xl lg:text-8xl"
        >
          Sentinel Treasury
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto mb-4 max-w-2xl text-lg text-slate-400 md:text-xl"
        >
          Enterprise autonomous treasury with{" "}
          <span className="text-cyan-400">trusted AI agents</span> — every payment
          identity-verified, delegation-authorized, and on-chain accountable.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-10 flex items-center justify-center gap-2 text-sm text-slate-500"
        >
          <Shield className="h-4 w-4 text-cyan-400/70" />
          <span>Identity → Authorization → Protected Action → Audit</span>
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="pointer-events-auto flex flex-wrap items-center justify-center gap-3"
        >
          <Button size="lg" asChild className="shadow-lg shadow-cyan-500/10">
            <Link href="/demo">
              Start Live Demo
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="border-slate-600 bg-slate-950/50 backdrop-blur-sm">
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default AetherFlowHero;
