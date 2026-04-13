"use client";

import {
  AutoImageProcessor,
  AutoModelForImageClassification,
  RawImage,
  type PretrainedModelOptions,
} from "@huggingface/transformers";

const MODEL_ID = "Xenova/vit-base-patch16-224";

let cached: {
  processor: Awaited<ReturnType<typeof AutoImageProcessor.from_pretrained>>;
  model: Awaited<ReturnType<typeof AutoModelForImageClassification.from_pretrained>>;
} | null = null;

export async function loadVit(onProgress?: (p: number) => void) {
  if (cached) return cached;

  const opts: PretrainedModelOptions = {
    progress_callback: (data: { progress?: number }) => {
      if (typeof data.progress === "number") onProgress?.(data.progress);
    },
  };

  const [processor, model] = await Promise.all([
    AutoImageProcessor.from_pretrained(MODEL_ID, opts),
    AutoModelForImageClassification.from_pretrained(MODEL_ID, {
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
  const { processor, model } = await loadVit();
  const raw = await RawImage.fromBlob(image);
  const inputs = await processor(raw);

  const output = await model(inputs, { output_attentions: true });

  const logits = output.logits.data as Float32Array;
  let maxIdx = 0;
  for (let i = 1; i < logits.length; i++) if (logits[i] > logits[maxIdx]) maxIdx = i;
  const id2label = (model.config as { id2label?: Record<number, string> }).id2label ?? {};
  const label = id2label[maxIdx] ?? `class_${maxIdx}`;

  // Stub: real attention extraction lands in the next commit
  const grid = Array.from({ length: 14 }, () =>
    Array.from({ length: 14 }, () => Math.random()),
  );

  return { label, score: logits[maxIdx], attention: grid };
}
