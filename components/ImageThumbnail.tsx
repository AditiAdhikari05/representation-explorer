"use client";

import { CIFAR10_LABELS, type EmbeddingPoint } from "@/lib/embeddings";

export default function ImageThumbnail({ point }: { point: EmbeddingPoint | null }) {
  return (
    <div className="rounded-md border border-ink/10 bg-paper p-4">
      <p className="text-sm font-medium">Hovered sample</p>
      <div className="mt-3 grid aspect-square w-full place-items-center overflow-hidden rounded bg-ink/5">
        {point ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={point.imageUrl}
            alt={CIFAR10_LABELS[point.label]}
            className="h-full w-full object-cover [image-rendering:pixelated]"
          />
        ) : (
          <span className="text-xs text-muted">Hover a point</span>
        )}
      </div>
      {point && (
        <p className="mt-3 text-sm">
          Class:{" "}
          <span className="font-mono">{CIFAR10_LABELS[point.label]}</span>
        </p>
      )}
    </div>
  );
}
