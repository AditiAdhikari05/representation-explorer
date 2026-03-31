export type ModelKind = "random" | "supervised" | "simclr";

export type EmbeddingPoint = {
  x: number;
  y: number;
  label: number; // CIFAR-10 class index 0..9
  imageUrl: string;
};

export type EpochEmbeddings = {
  epoch: number;
  points: EmbeddingPoint[];
};

export type EmbeddingsDataset = {
  model: ModelKind;
  epochs: EpochEmbeddings[];
};

export const CIFAR10_LABELS = [
  "airplane",
  "automobile",
  "bird",
  "cat",
  "deer",
  "dog",
  "frog",
  "horse",
  "ship",
  "truck",
] as const;

export const CLASS_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
];

export async function loadEmbeddings(model: ModelKind): Promise<EmbeddingsDataset> {
  const res = await fetch(`/data/embeddings.${model}.json`, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to load embeddings for ${model}`);
  return res.json();
}
