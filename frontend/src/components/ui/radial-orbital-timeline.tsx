"use client";

import { useState, useEffect, useRef } from "react";
import type { ElementType } from "react";
import { ArrowRight, Link as LinkIcon, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
  className?: string;
}

export function RadialOrbitalTimeline({ timelineData, className }: RadialOrbitalTimelineProps) {
  const [mounted, setMounted] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset] = useState({ x: 0, y: 0 });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    setMounted(true);
    setAutoRotate(true);
  }, []);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const centerViewOnNode = (nodeId: number) => {
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key, 10) !== id) {
          newState[parseInt(key, 10)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);
        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    if (!mounted || !autoRotate) return;

    const rotationTimer = setInterval(() => {
      setRotationAngle((prev) => Number(((prev + 0.3) % 360).toFixed(3)));
    }, 50);

    return () => clearInterval(rotationTimer);
  }, [autoRotate, mounted]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 200;
    const radian = (angle * Math.PI) / 180;

    const x = Math.round((radius * Math.cos(radian) + centerOffset.x) * 100) / 100;
    const y = Math.round((radius * Math.sin(radian) + centerOffset.y) * 100) / 100;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity =
      Math.round(Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))) * 1000) / 1000;

    return { x, y, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    return getRelatedItems(activeNodeId).includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-slate-950 bg-[#BF80FF] border-violet-400/50";
      case "in-progress":
        return "text-slate-100 bg-violet-500/20 border-violet-400/40";
      case "pending":
        return "text-slate-300 bg-black/60 border-violet-500/30";
      default:
        return "text-slate-300 bg-black/60 border-violet-500/30";
    }
  };

  return (
    <div
      className={cn(
        "flex h-[min(720px,85vh)] w-full flex-col items-center justify-center overflow-hidden bg-black",
        className,
      )}
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative flex h-full w-full max-w-4xl items-center justify-center">
        <div
          className="absolute flex h-full w-full items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          <div className="absolute z-10 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-violet-400 via-[#BF80FF] to-violet-600">
            <div className="absolute h-20 w-20 animate-ping rounded-full border border-violet-400/30 opacity-70" />
            <div
              className="absolute h-24 w-24 animate-ping rounded-full border border-violet-400/20 opacity-50"
              style={{ animationDelay: "0.5s" }}
            />
            <div className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-md" />
          </div>

          <div className="absolute h-96 w-96 rounded-full border border-violet-500/20" />

          {mounted &&
            timelineData.map((item, index) => {
              const position = calculateNodePosition(index, timelineData.length);
              const isExpanded = expandedItems[item.id];
              const isRelated = isRelatedToActive(item.id);
              const isPulsing = pulseEffect[item.id];
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    nodeRefs.current[item.id] = el;
                  }}
                  className="absolute cursor-pointer transition-all duration-700"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    zIndex: isExpanded ? 200 : position.zIndex,
                    opacity: isExpanded ? 1 : position.opacity,
                  }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={cn("absolute -inset-1 rounded-full", isPulsing && "animate-pulse duration-1000")}
                  style={{
                    background: "radial-gradient(circle, rgba(191,128,255,0.25) 0%, rgba(191,128,255,0) 70%)",
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                />

                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isExpanded
                      ? "scale-150 border-violet-300 bg-[#BF80FF] text-slate-950 shadow-lg shadow-violet-500/30"
                      : isRelated
                        ? "animate-pulse border-violet-300 bg-violet-500/30 text-violet-100"
                        : "border-violet-500/40 bg-black text-violet-200",
                  )}
                >
                  <Icon size={16} />
                </div>

                <div
                  className={cn(
                    "absolute top-12 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300",
                    isExpanded ? "scale-125 text-violet-200" : "text-slate-400",
                  )}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card className="absolute top-20 left-1/2 w-64 -translate-x-1/2 overflow-visible border-violet-500/30 bg-black/95 shadow-xl shadow-violet-500/10 backdrop-blur-lg">
                    <div className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-violet-400/50" />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge className={cn("rounded-full px-2 text-xs", getStatusStyles(item.status))}>
                          {item.status === "completed"
                            ? "COMPLETE"
                            : item.status === "in-progress"
                              ? "IN PROGRESS"
                              : "PENDING"}
                        </Badge>
                        <span className="font-mono text-xs text-slate-500">{item.date}</span>
                      </div>
                      <CardTitle className="mt-2 text-sm text-slate-100">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-400">
                      <p>{item.content}</p>

                      <div className="mt-4 border-t border-violet-500/15 pt-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="flex items-center text-slate-400">
                            <Zap size={10} className="mr-1 text-violet-300" />
                            T3 Coverage
                          </span>
                          <span className="font-mono text-violet-300">{item.energy}%</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-violet-500/10">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-[#BF80FF]"
                            style={{ width: `${item.energy}%` }}
                          />
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 border-t border-violet-500/15 pt-3">
                          <div className="mb-2 flex items-center">
                            <LinkIcon size={10} className="mr-1 text-violet-300/70" />
                            <h4 className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                              Next in pipeline
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find((i) => i.id === relatedId);
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="h-6 rounded-md border-violet-500/25 bg-transparent px-2 py-0 text-xs text-slate-300 hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-violet-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight size={8} className="ml-1 text-violet-400/70" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
