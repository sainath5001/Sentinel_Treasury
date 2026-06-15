"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Fingerprint, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

type ParticleState = {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  size: number;
  color: string;
};

const AetherFlowHero = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: ParticleState[] = [];
    const mouse = { x: null as number | null, y: null as number | null, radius: 200 };

    const drawParticle = (p: ParticleState) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
      ctx.fillStyle = p.color;
      ctx.fill();
    };

    const updateParticle = (p: ParticleState) => {
      if (p.x > canvas.width || p.x < 0) p.directionX = -p.directionX;
      if (p.y > canvas.height || p.y < 0) p.directionY = -p.directionY;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius + p.size) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          p.x -= forceDirectionX * force * 5;
          p.y -= forceDirectionY * force * 5;
        }
      }

      p.x += p.directionX;
      p.y += p.directionY;
      drawParticle(p);
    };

    const init = () => {
      particles = [];
      const numberOfParticles = (canvas.height * canvas.width) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 1;
        particles.push({
          x: Math.random() * (canvas.width - size * 4) + size * 2,
          y: Math.random() * (canvas.height - size * 4) + size * 2,
          directionX: Math.random() * 0.4 - 0.2,
          directionY: Math.random() * 0.4 - 0.2,
          size,
          color: "rgba(191, 128, 255, 0.8)",
        });
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const distance =
            (particles[a].x - particles[b].x) ** 2 + (particles[a].y - particles[b].y) ** 2;

          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            const opacityValue = 1 - distance / 20000;

            if (mouse.x !== null && mouse.y !== null) {
              const dxMouseA = particles[a].x - mouse.x;
              const dyMouseA = particles[a].y - mouse.y;
              const distanceMouseA = Math.sqrt(dxMouseA ** 2 + dyMouseA ** 2);
              ctx.strokeStyle =
                distanceMouseA < mouse.radius
                  ? `rgba(255, 255, 255, ${opacityValue})`
                  : `rgba(200, 150, 255, ${opacityValue})`;
            } else {
              ctx.strokeStyle = `rgba(200, 150, 255, ${opacityValue})`;
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
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) updateParticle(particle);
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
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 h-full w-full" />

      <div className="relative z-10 p-6 text-center">
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 backdrop-blur-sm"
        >
          <Fingerprint className="h-4 w-4 text-violet-300" />
          <span className="text-sm font-medium text-slate-200">
            Powered by Terminal 3 Agent Identity
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 text-5xl font-bold tracking-tight text-slate-100 md:text-7xl lg:text-8xl"
        >
          Sentinel Treasury
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto mb-6 max-w-2xl text-lg text-slate-400 md:text-xl"
        >
          Enterprise autonomous treasury with{" "}
          <span className="text-violet-300">trusted AI agents</span> — every payment
          identity-verified, delegation-authorized, and on-chain accountable.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-10 flex items-center justify-center gap-2 text-sm text-slate-500"
        >
          <Shield className="h-4 w-4 text-violet-300/80" />
          <span>Identity → Authorization → Protected Action → Audit</span>
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            size="lg"
            asChild
            className="border-0 bg-[#BF80FF] text-slate-950 shadow-lg shadow-violet-500/25 hover:bg-[#C896FF]"
          >
            <Link href="/demo">
              Start Live Demo
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-slate-600 bg-slate-950/50 text-slate-100 backdrop-blur-sm hover:bg-slate-900"
          >
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default AetherFlowHero;
export { AetherFlowHero };
