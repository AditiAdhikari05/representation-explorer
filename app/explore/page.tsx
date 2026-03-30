export default function ExplorePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold">Explore embeddings</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          500 CIFAR-10 samples projected to 2D with UMAP. Drag the epoch slider to watch
          the SimCLR encoder pull same-class images together. Toggle between random init,
          supervised, and SimCLR to compare what each model learns.
        </p>
      </header>

      <div className="mt-8 rounded-lg border border-ink/10 p-6">
        <div className="grid aspect-[16/10] place-items-center rounded-md bg-ink/5 text-sm text-muted">
          UMAP scatter loads here
        </div>
      </div>
    </main>
  );
}
