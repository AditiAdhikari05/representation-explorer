"use client";

import type { ModelKind } from "@/lib/embeddings";

const OPTIONS: { kind: ModelKind; label: string; hint: string }[] = [
  { kind: "random", label: "Random", hint: "untrained init" },
  { kind: "supervised", label: "Supervised", hint: "cross-entropy on labels" },
  { kind: "simclr", label: "SimCLR", hint: "self-supervised contrastive" },
];

type Props = {
  value: ModelKind;
  onChange: (m: ModelKind) => void;
};

export default function ModelToggle({ value, onChange }: Props) {
  return (
    <div className="rounded-md border border-ink/10 bg-paper p-4">
      <p className="text-sm font-medium">Model</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => {
          const active = o.kind === value;
          return (
            <button
              key={o.kind}
              onClick={() => onChange(o.kind)}
              className={
                "rounded-md border px-3 py-2 text-left text-sm transition " +
                (active
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-ink/10 hover:border-ink/30")
              }
            >
              <div className="font-medium">{o.label}</div>
              <div className="text-xs text-muted">{o.hint}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
