"use client";

import { useCallback, useState } from "react";
import AttentionViewer from "@/components/AttentionViewer";
import { runAttention, type AttentionResult } from "@/lib/vit";

export default function AttentionPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AttentionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    setImageUrl(URL.createObjectURL(file));
    setLoading(true);
    setProgress(0);
    try {
      const r = await runAttention(file);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to run ViT");
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold">ViT attention</h1>
        <p className="mt-2 text-sm text-muted">
          Upload an image. ViT-Base runs in your browser via transformers.js. Nothing
          leaves your machine — first load downloads ~85MB of weights and caches them.
        </p>
      </header>

      <div className="mt-8 space-y-6">
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="grid aspect-[16/9] w-full cursor-pointer place-items-center rounded-md border-2 border-dashed border-ink/15 text-sm text-muted transition hover:border-accent hover:bg-accent/5"
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <div className="text-center">
            <p>Drop image here, or click to select</p>
            <p className="mt-1 text-xs">PNG / JPG up to ~5MB</p>
          </div>
        </label>

        {loading && (
          <div className="rounded-md border border-ink/10 p-4 text-sm text-muted">
            Running ViT…{" "}
            <span className="font-mono">{progress > 0 ? `${Math.round(progress)}%` : "…"}</span>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {imageUrl && <AttentionViewer imageUrl={imageUrl} result={result} />}
      </div>
    </main>
  );
}
