"use client";

import { useEffect, useRef } from "react";
import type { AttentionResult } from "@/lib/vit";

type Props = {
  imageUrl: string;
  result: AttentionResult | null;
};

export default function AttentionViewer({ imageUrl, result }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const rows = result.attention.length;
    const cols = result.attention[0]?.length ?? 0;
    if (!rows || !cols) return;

    const cellW = W / cols;
    const cellH = H / rows;

    ctx.clearRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = result.attention[r][c];
        ctx.fillStyle = `rgba(99, 102, 241, ${Math.min(0.85, v)})`;
        ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
      }
    }
  }, [result]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <figure>
        <figcaption className="mb-2 text-xs uppercase tracking-wider text-muted">
          Input
        </figcaption>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="input"
          className="aspect-square w-full rounded-md object-cover"
        />
      </figure>

      <figure>
        <figcaption className="mb-2 text-xs uppercase tracking-wider text-muted">
          Attention
        </figcaption>
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-ink/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="overlay base"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <canvas
            ref={canvasRef}
            width={224}
            height={224}
            className="relative h-full w-full mix-blend-multiply"
          />
        </div>
      </figure>

      {result && (
        <p className="col-span-2 text-sm">
          Top class: <span className="font-mono">{result.label}</span>
        </p>
      )}
    </div>
  );
}
