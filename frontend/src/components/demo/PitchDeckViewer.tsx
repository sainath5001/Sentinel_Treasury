"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PITCH_DECK } from "@/content/pitch-deck";

export function PitchDeckViewer() {
  const [index, setIndex] = useState(0);
  const slide = PITCH_DECK[index];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="info" className="mb-2">
              Slide {index + 1} / {PITCH_DECK.length}
            </Badge>
            <CardTitle>{slide.title}</CardTitle>
            {slide.subtitle && (
              <p className="mt-1 text-sm text-slate-400">{slide.subtitle}</p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={index === PITCH_DECK.length - 1}
              onClick={() => setIndex((i) => i + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {slide.highlight && (
          <div className="mb-6 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">
            <p className="text-sm font-medium text-cyan-300">{slide.highlight}</p>
          </div>
        )}
        <ul className="space-y-3">
          {slide.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-sm text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              {bullet}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
