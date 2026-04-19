"""Train a small SimCLR encoder on CIFAR-10 and snapshot weights per epoch.

Snapshots are saved to python/checkpoints/simclr_epoch_{epoch}.pt for later
projection by export_umap.py. This is the offline side of the pipeline; the
Next.js app never imports torch.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision
from torch.utils.data import DataLoader
from torchvision import transforms
from tqdm import tqdm

CKPT_DIR = Path(__file__).parent / "checkpoints"
DATA_DIR = Path(__file__).parent / "data"
SNAPSHOT_EPOCHS = (0, 50, 100, 200)


class Encoder(nn.Module):
    def __init__(self, dim: int = 128) -> None:
        super().__init__()
        backbone = torchvision.models.resnet18(weights=None)
        backbone.fc = nn.Identity()
        self.backbone = backbone
        self.proj = nn.Sequential(nn.Linear(512, 512), nn.ReLU(), nn.Linear(512, dim))

    def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        h = self.backbone(x)
        z = F.normalize(self.proj(h), dim=-1)
        return h, z


def nt_xent(z1: torch.Tensor, z2: torch.Tensor, temperature: float = 0.5) -> torch.Tensor:
    z = torch.cat([z1, z2], dim=0)
    sim = z @ z.T / temperature
    n = z1.size(0)
    mask = torch.eye(2 * n, device=z.device, dtype=torch.bool)
    sim = sim.masked_fill(mask, float("-inf"))
    targets = torch.cat([torch.arange(n, 2 * n), torch.arange(0, n)]).to(z.device)
    return F.cross_entropy(sim, targets)


def build_loader(batch_size: int) -> DataLoader:
    aug = transforms.Compose(
        [
            transforms.RandomResizedCrop(32, scale=(0.5, 1.0)),
            transforms.RandomHorizontalFlip(),
            transforms.ColorJitter(0.4, 0.4, 0.4, 0.1),
            transforms.RandomGrayscale(p=0.2),
            transforms.ToTensor(),
        ]
    )

    class TwoView:
        def __init__(self, t):
            self.t = t

        def __call__(self, x):
            return self.t(x), self.t(x)

    dataset = torchvision.datasets.CIFAR10(
        root=str(DATA_DIR), train=True, download=True, transform=TwoView(aug)
    )
    return DataLoader(dataset, batch_size=batch_size, shuffle=True, num_workers=2, drop_last=True)


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--epochs", type=int, default=200)
    p.add_argument("--batch_size", type=int, default=256)
    p.add_argument("--lr", type=float, default=3e-4)
    args = p.parse_args()

    CKPT_DIR.mkdir(parents=True, exist_ok=True)
    device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"

    model = Encoder().to(device)
    opt = torch.optim.AdamW(model.parameters(), lr=args.lr)
    loader = build_loader(args.batch_size)

    if 0 in SNAPSHOT_EPOCHS:
        torch.save(model.state_dict(), CKPT_DIR / "simclr_epoch_0.pt")

    for epoch in range(1, args.epochs + 1):
        model.train()
        for (v1, v2), _ in tqdm(loader, desc=f"epoch {epoch}"):
            v1, v2 = v1.to(device), v2.to(device)
            _, z1 = model(v1)
            _, z2 = model(v2)
            loss = nt_xent(z1, z2)
            opt.zero_grad()
            loss.backward()
            opt.step()

        if epoch in SNAPSHOT_EPOCHS:
            torch.save(model.state_dict(), CKPT_DIR / f"simclr_epoch_{epoch}.pt")


if __name__ == "__main__":
    main()
