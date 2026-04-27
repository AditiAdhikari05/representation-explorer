"use client";

// Note: transformers.js is loaded lazily inside loadVit() so webpack never
// bundles it server-side (the package pulls onnxruntime-node native bindings
// that break Vercel builds). On the client it lands as its own chunk on first
// /attention visit and is cached thereafter.

const MODEL_ID = "Xenova/vit-base-patch16-224";

type Cached = {
  processor: unknown;
  model: unknown;
};

let cached: Cached | null = null;

export async function loadVit(onProgress?: (p: number) => void): Promise<Cached> {
  if (cached) return cached;

  const tx = await import("@huggingface/transformers");

  const opts = {
    progress_callback: (data: { progress?: number }) => {
      if (typeof data.progress === "number") onProgress?.(data.progress);
    },
  };

  const [processor, model] = await Promise.all([
    tx.AutoImageProcessor.from_pretrained(MODEL_ID, opts),
    tx.AutoModelForImageClassification.from_pretrained(MODEL_ID, {
      ...opts,
      dtype: "fp32",
    }),
  ]);

  cached = { processor, model };
  return cached;
}

export type AttentionResult = {
  label: string;
  score: number;
  attention: number[][]; // 14x14 grid for ViT-Base/16 at 224
};

export async function runAttention(image: Blob): Promise<AttentionResult> {
  const tx = await import("@huggingface/transformers");
  const { processor, model } = await loadVit();

  const raw = await tx.RawImage.fromBlob(image);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputs = await (processor as any)(raw);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output = await (model as any)(inputs, { output_attentions: true });

  const logits = output.logits.data as Float32Array;
  let maxIdx = 0;
  for (let i = 1; i < logits.length; i++) if (logits[i] > logits[maxIdx]) maxIdx = i;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const id2label = ((model as any).config?.id2label ?? {}) as Record<number, string>;
  const label = id2label[maxIdx] ?? `class_${maxIdx}`;

  // Stub attention grid until real extraction lands.
  const grid = Array.from({ length: 14 }, () =>
    Array.from({ length: 14 }, () => Math.random()),
  );

  return { label, score: logits[maxIdx], attention: grid };
}
