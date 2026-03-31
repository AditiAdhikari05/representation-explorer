"use client";

import { CIFAR10_LABELS, CLASS_COLORS, type EmbeddingPoint } from "@/lib/embeddings";

type Props = {
  points: EmbeddingPoint[];
  onHover?: (p: EmbeddingPoint | null) => void;
};

export default function UmapScatter({ points }: Props) {
  // Placeholder svg scatter. Will swap to react-plotly in next commit.
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 1);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 1);

  const W = 800;
  const H = 500;
  const pad = 24;
  const norm = (v: number, min: number, max: number, size: number) =>
    pad + ((v - min) / (max - min || 1)) * (size - 2 * pad);

  return (
    <div className="w-full overflow-hidden rounded-md border border-ink/10 bg-paper">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
        {points.map((p, i) => (
          <circle
            key={i}
            cx={norm(p.x, minX, maxX, W)}
            cy={H - norm(p.y, minY, maxY, H)}
            r={3}
            fill={CLASS_COLORS[p.label]}
            opacity={0.85}
          >
            <title>{CIFAR10_LABELS[p.label]}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}
