#!/usr/bin/env python3
"""One-time fetch of SinaLite-style product mockups for local storefront use."""

from __future__ import annotations

import pathlib
import urllib.request

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "images" / "products" / "large-format"

DOWNLOADS: dict[str, str] = {
    "coroplast-signs.jpg": "https://sinalite.com/media/images/lawn-sign-printing.jpg",
    "floor-graphics.png": "https://sinalite.com/media/resized/floor-graphic-main-new.png",
    "foam-board.jpg": "https://sinalite.com/media/images/Foamboard.jpg",
    "aluminum-signs.png": "https://sinalite.com/media/resized/al-sign-main.png",
    "banners.png": "https://sinalite.com/media/resized/mesh-banner.png",
    "roll-up-banners.png": "https://sinalite.com/media/resized/Standard-Pullup-banner-black.png",
    "car-door-magnets.jpg": "https://sinalite.com/media/images/Car_Magnets.jpg",
    "table-covers.png": "https://sinalite.com/media/resized/table-cover-main.png",
    "adhesive-vinyl.png": "https://sinalite.com/media/catalog/category/adhesive-vinyl-a-_1_.png",
    "window-graphics.jpg": "https://sinalite.com/media/images/window-signage.jpg",
    "large-format-posters.jpg": "https://sinalite.com/media/images/large-format-poster-printing.jpg",
    "styrene-signs.jpg": "https://sinalite.com/media/images/styrenesign.jpg",
    "display-board-pop.jpg": "https://sinalite.com/media/images/display_board.jpg",
    "canvas-prints.jpg": "https://sinalite.com/media/images/Canvas.jpg",
    "sintra-pvc.jpg": "https://sinalite.com/media/catalog/category/icon-sintra.jpg",
    "x-frame-banners.jpg": "https://sinalite.com/media/images/X-Banner.jpg",
    "a-frame-signs.jpg": "https://sinalite.com/media/images/a-frame-one.jpg",
    "wall-decals.png": "https://sinalite.com/media/images/wall-decals.png",
    "a-frame-stands.jpg": "https://sinalite.com/media/images/icon-aframe_office.jpg",
    "h-stands.jpg": "https://sinalite.com/media/images/icon-hstand.jpg",
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for filename, url in DOWNLOADS.items():
        dest = OUT / filename
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as resp:
            dest.write_bytes(resp.read())
        print(f"saved {dest.name} ({dest.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
