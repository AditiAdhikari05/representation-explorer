import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <section>
        <p className="text-sm uppercase tracking-widest text-muted">
          Representation Learning Explorer
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
          See what a neural network learns,{" "}
          <span className="text-accent">not just how well it scores.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          Drag the epoch slider and watch a SimCLR model carve CIFAR-10 into clusters in
          real time. Switch between random, supervised, and self-supervised initializations
          to compare what each one learns about the same images.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/explore"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Explore UMAP →
          </Link>
          <Link
            href="/attention"
            className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium hover:bg-ink/5"
          >
            See ViT attention
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        <Feature
          title="UMAP scatter"
          body="500 CIFAR-10 samples projected to 2D. Hover any point to see the image."
        />
        <Feature
          title="Epoch slider"
          body="Watch clusters form across epochs 0 → 200 of SimCLR pretraining."
        />
        <Feature
          title="ViT attention"
          body="Upload your own image. ViT runs in the browser via transformers.js."
        />
      </section>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-ink/10 p-4">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}
