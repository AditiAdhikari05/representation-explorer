"""Project SimCLR / supervised / random encoder outputs to 2D with UMAP.

Reads checkpoints from python/checkpoints/, projects a fixed sample of 500
CIFAR-10 test images, writes thumbnails to public/images/, and dumps
public/data/embeddings.{simclr,supervised,random}.json for the Next.js app
to consume.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torchvision
import umap
from PIL import Image
from torchvision import transforms

from train_simclr import Encoder

ROOT = Path(__file__).parent.parent
CKPT_DIR = Path(__file__).parent / "checkpoints"
IMG_OUT = ROOT / "public" / "images"
DATA_OUT = ROOT / "public" / "data"

N_SAMPLES = 500
SNAPSHOT_EPOCHS = (0, 50, 100, 200)


def load_samples(n: int) -> tuple[torch.Tensor, list[int], list[Image.Image]]:
    tx = transforms.ToTensor()
    ds = torchvision.datasets.CIFAR10(
        root=str(Path(__file__).parent / "data"), train=False, download=True, transform=tx
    )
    rng = np.random.default_rng(42)
    idx = rng.choice(len(ds), size=n, replace=False)
    xs, ys, pil = [], [], []
    for i in idx:
        x, y = ds[int(i)]
        xs.append(x)
        ys.append(int(y))
        pil.append(transforms.ToPILImage()(x))
    return torch.stack(xs), ys, pil


def write_thumbnails(pil: list[Image.Image]) -> list[str]:
    IMG_OUT.mkdir(parents=True, exist_ok=True)
    urls: list[str] = []
    for i, im in enumerate(pil):
        im.resize((96, 96), Image.NEAREST).save(IMG_OUT / f"{i:04d}.png")
        urls.append(f"/images/{i:04d}.png")
    return urls


@torch.no_grad()
def encode(model: nn.Module, x: torch.Tensor, device: str) -> np.ndarray:
    model.eval().to(device)
    h, _ = model(x.to(device))
    return h.cpu().numpy()


def project(features: np.ndarray) -> np.ndarray:
    reducer = umap.UMAP(n_components=2, n_neighbors=15, min_dist=0.1, random_state=42)
    return reducer.fit_transform(features)


def export_for_model(model: str, x: torch.Tensor, ys: list[int], urls: list[str], device: str) -> None:
    epochs_payload = []
    for ep in SNAPSHOT_EPOCHS:
        net = Encoder()
        ckpt = CKPT_DIR / f"{model}_epoch_{ep}.pt"
        if ckpt.exists():
            net.load_state_dict(torch.load(ckpt, map_location="cpu"))
        feats = encode(net, x, device)
        proj = project(feats)
        epochs_payload.append(
            {
                "epoch": ep,
                "points": [
                    {"x": float(proj[i, 0]), "y": float(proj[i, 1]), "label": ys[i], "imageUrl": urls[i]}
                    for i in range(len(ys))
                ],
            }
        )

    DATA_OUT.mkdir(parents=True, exist_ok=True)
    out = DATA_OUT / f"embeddings.{model}.json"
    out.write_text(json.dumps({"model": model, "epochs": epochs_payload}))
    print(f"wrote {out}")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--models", nargs="+", default=["simclr", "supervised", "random"])
    args = p.parse_args()

    device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
    x, ys, pil = load_samples(N_SAMPLES)
    urls = write_thumbnails(pil)

    for m in args.models:
        export_for_model(m, x, ys, urls, device)


if __name__ == "__main__":
    main()
