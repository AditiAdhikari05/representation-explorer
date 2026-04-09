"use client";

import { useEffect, useMemo, useState } from "react";
import EpochSlider from "@/components/EpochSlider";
import ImageThumbnail from "@/components/ImageThumbnail";
import ModelToggle from "@/components/ModelToggle";
import UmapScatter from "@/components/UmapScatter";
import {
  loadEmbeddings,
  type EmbeddingPoint,
  type EmbeddingsDataset,
  type ModelKind,
} from "@/lib/embeddings";

export default function ExplorePage() {
  const [model, setModel] = useState<ModelKind>("simclr");
  const [data, setData] = useState<EmbeddingsDataset | null>(null);
  const [epoch, setEpoch] = useState<number>(0);
  const [hovered, setHovered] = useState<EmbeddingPoint | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    loadEmbeddings(model)
      .then((d) => {
        setData(d);
        setEpoch(d.epochs[d.epochs.length - 1]?.epoch ?? 0);
      })
      .catch((e: Error) => setError(e.message));
  }, [model]);

  const points = useMemo(() => {
    if (!data) return [];
    const exact = data.epochs.find((e) => e.epoch === epoch);
    return exact?.points ?? data.epochs[0]?.points ?? [];
  }, [data, epoch]);

  const epochList = useMemo(() => data?.epochs.map((e) => e.epoch) ?? [], [data]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold">Explore embeddings</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          500 CIFAR-10 samples projected to 2D with UMAP. Drag the epoch slider to watch
          the encoder pull same-class images together. Toggle between random init,
          supervised, and SimCLR to compare what each model learns.
        </p>
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {error ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-600">
              {error}. Run the offline pipeline to generate
              <code className="ml-1 rounded bg-ink/10 px-1">public/data/embeddings.*.json</code>.
            </div>
          ) : (
            <UmapScatter points={points} onHover={setHovered} />
          )}
          {epochList.length > 0 && (
            <EpochSlider epochs={epochList} value={epoch} onChange={setEpoch} />
          )}
        </div>

        <aside className="space-y-4">
          <ModelToggle value={model} onChange={setModel} />
          <ImageThumbnail point={hovered} />
        </aside>
      </div>
    </main>
  );
}
