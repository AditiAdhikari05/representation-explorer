"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { CIFAR10_LABELS, CLASS_COLORS, type EmbeddingPoint } from "@/lib/embeddings";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type Props = {
  points: EmbeddingPoint[];
  onHover?: (p: EmbeddingPoint | null) => void;
};

export default function UmapScatter({ points, onHover }: Props) {
  const traces = useMemo(() => {
    const byClass = new Map<number, EmbeddingPoint[]>();
    for (const p of points) {
      const list = byClass.get(p.label) ?? [];
      list.push(p);
      byClass.set(p.label, list);
    }
    return Array.from(byClass.entries()).map(([label, pts]) => ({
      type: "scattergl" as const,
      mode: "markers" as const,
      name: CIFAR10_LABELS[label],
      x: pts.map((p) => p.x),
      y: pts.map((p) => p.y),
      customdata: pts.map((p) => p.imageUrl),
      marker: { color: CLASS_COLORS[label], size: 6, opacity: 0.85 },
      hovertemplate: "%{fullData.name}<extra></extra>",
    }));
  }, [points]);

  return (
    <div className="w-full overflow-hidden rounded-md border border-ink/10 bg-paper">
      <Plot
        data={traces}
        layout={{
          autosize: true,
          margin: { l: 24, r: 24, t: 8, b: 24 },
          showlegend: true,
          legend: { orientation: "h", y: -0.15 },
          dragmode: "pan",
          xaxis: { zeroline: false, showgrid: false, showticklabels: false },
          yaxis: { zeroline: false, showgrid: false, showticklabels: false },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: "100%", height: 520 }}
        onHover={(e) => {
          const pt = e.points?.[0];
          if (!pt) return onHover?.(null);
          const idx = pt.pointNumber;
          const cls = points.find((p) => p.x === pt.x && p.y === pt.y);
          onHover?.(cls ?? null);
          void idx;
        }}
        onUnhover={() => onHover?.(null)}
      />
    </div>
  );
}
