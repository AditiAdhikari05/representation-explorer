export default function AttentionPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold">ViT attention</h1>
        <p className="mt-2 text-sm text-muted">
          Upload an image. A ViT-Base model runs in your browser via transformers.js and
          renders its attention map next to your image. Nothing leaves your machine.
        </p>
      </header>

      <div className="mt-8 rounded-lg border border-ink/10 p-6">
        <div className="grid aspect-square w-full max-w-sm place-items-center rounded-md border-2 border-dashed border-ink/15 text-sm text-muted">
          Drop image here
        </div>
      </div>
    </main>
  );
}
