"use client";

type Props = {
  epochs: number[];
  value: number;
  onChange: (epoch: number) => void;
};

export default function EpochSlider({ epochs, value, onChange }: Props) {
  const min = epochs[0] ?? 0;
  const max = epochs[epochs.length - 1] ?? 0;

  return (
    <div className="rounded-md border border-ink/10 bg-paper p-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Epoch</label>
        <span className="font-mono text-sm">{value}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          const snapped = epochs.reduce((best, ep) =>
            Math.abs(ep - v) < Math.abs(best - v) ? ep : best,
          );
          onChange(snapped);
        }}
        className="mt-3 w-full accent-accent"
      />

      <div className="mt-2 flex justify-between font-mono text-xs text-muted">
        {epochs.map((ep) => (
          <button
            key={ep}
            onClick={() => onChange(ep)}
            className={ep === value ? "text-accent" : "hover:text-ink"}
          >
            {ep}
          </button>
        ))}
      </div>
    </div>
  );
}
