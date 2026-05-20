"use client";

// transformers.js is loaded from CDN at runtime via `webpackIgnore` so Next's
// webpack never tries to bundle the package (the npm version pulls in
// onnxruntime-node native binaries and a pre-webpacked dist that don't play
// well with Next 14's compiler).

const TRANSFORMERS_CDN =
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0/+esm";

const MODEL_ID = "Xenova/vit-base-patch16-224";

type TransformersModule = {
  AutoImageProcessor: { from_pretrained: (id: string, opts: object) => Promise<unknown> };
  AutoModelForImageClassification: {
    from_pretrained: (id: string, opts: object) => Promise<unknown>;
  };
  RawImage: { fromBlob: (b: Blob) => Promise<unknown> };
};

let txPromise: Promise<TransformersModule> | null = null;

async function getTransformers(): Promise<TransformersModule> {
  if (!txPromise) {
    txPromise = import(/* webpackIgnore: true */ TRANSFORMERS_CDN) as Promise<TransformersModule>;
  }
  return txPromise;
}

type Cached = {
  processor: unknown;
  model: unknown;
};

let cached: Cached | null = null;

export async function loadVit(onProgress?: (p: number) => void): Promise<Cached> {
  if (cached) return cached;

  const tx = await getTransformers();

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
  const tx = await getTransformers();
  const { processor, model } = await loadVit();

  const raw = await tx.RawImage.fromBlob(image);
  const processorFn = processor as (input: unknown) => Promise<unknown>;
  const inputs = await processorFn(raw);

  type ModelCallable = (
    inputs: unknown,
    opts: { output_attentions: boolean },
  ) => Promise<{ logits: { data: Float32Array } }>;
  const modelFn = model as ModelCallable;
  const output = await modelFn(inputs, { output_attentions: true });

  const logits = output.logits.data;
  let maxIdx = 0;
  for (let i = 1; i < logits.length; i++) if (logits[i] > logits[maxIdx]) maxIdx = i;

  const modelWithConfig = model as { config?: { id2label?: Record<number, string> } };
  const id2label = modelWithConfig.config?.id2label ?? {};
  const label = id2label[maxIdx] ?? `class_${maxIdx}`;

  // Stub attention grid until real extraction lands.
  const grid = Array.from({ length: 14 }, () =>
    Array.from({ length: 14 }, () => Math.random()),
  );

  return { label, score: logits[maxIdx], attention: grid };
}
