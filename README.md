# Representation Learning Explorer

[![next](https://img.shields.io/badge/Next.js-14-000)](https://nextjs.org)
[![tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com)
[![transformers.js](https://img.shields.io/badge/transformers.js-3-ff9d00)](https://huggingface.co/docs/transformers.js)

Interactive web app showing what a neural network *sees*. Upload an image,
watch a UMAP of learned embeddings evolve across SimCLR pretraining epochs,
and compare random vs supervised vs self-supervised init on the same data.

## What it does

- `/` — landing + project description
- `/explore` — interactive UMAP scatter of 500 CIFAR-10 samples. Hover any
  point to see the image. Drag the epoch slider to watch clusters form.
  Toggle between random / supervised / SimCLR.
- `/attention` — drop in any image. ViT-Base runs in your browser via
  transformers.js and overlays its attention map next to the input.

Zero server cost: all inference is in the browser, all embeddings are
static JSON.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- react-plotly.js (UMAP scatter)
- @huggingface/transformers (ViT in browser)

Offline pipeline:

- PyTorch + torchvision (SimCLR encoder)
- umap-learn (2D projection)

## Run locally

```bash
pnpm install            # or npm install
pnpm dev                # http://localhost:3000
```

## Generate the embeddings

```bash
cd python
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python train_simclr.py --epochs 200
python export_umap.py
```

Writes `public/data/embeddings.{simclr,supervised,random}.json` and 500
thumbnails to `public/images/`. The web app picks them up on next load.

## Deploy

```bash
vercel
```

That's it. No backend, no API routes, no database.

## Project layout

```
app/
  page.tsx              landing
  explore/page.tsx      UMAP explorer
  attention/page.tsx    ViT attention viewer
components/             UI building blocks
lib/
  embeddings.ts         types + JSON loader
  vit.ts                transformers.js ViT runner
public/
  data/                 generated embeddings JSON
  images/               sample thumbnails
python/
  train_simclr.py       offline training loop
  export_umap.py        UMAP projection + thumbnail export
```

## License

MIT — see [LICENSE](./LICENSE).
