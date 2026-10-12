"""
Resize photos for the website and regenerate images/photos/photos.json.

Usage:
    pip install pillow
    1. Drop full-size photos into images/actualphotos/ (not committed)
    2. python scripts/build_photos.py
    3. In images/photos/photos.json, set each new photo's "category" to
       "street", "landscape" or "product" and optionally add a caption (kept on re-runs)

Photos are auto-rotated, resized, and saved WITHOUT EXIF metadata,
so GPS location / camera serials never end up on the public site.
New photos are added to the top of the gallery, newest shot first.
Duplicates are skipped: identical files, and re-exports of a frame that is
already in the gallery under another number (4-DSCF6242 vs 7-DSCF6242). To reorder, move entries around in
photos.json. Remove a photo by deleting its original and re-running.
"""
import hashlib
import json
import re
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "images" / "actualphotos"
OUT = ROOT / "images" / "photos"
THUMBS = OUT / "thumbs"
MANIFEST = OUT / "photos.json"

FULL_SIZE = 2000   # long edge for the lightbox
THUMB_SIZE = 900   # long edge for the grid
QUALITY = 82
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}


def date_taken(img):
    # DateTimeOriginal lives in the Exif sub-IFD; fall back to DateTime
    exif = img.getexif()
    return exif.get_ifd(0x8769).get(0x9003) or exif.get(0x0132) or ""


def output_name(src):
    return src.stem.replace(" ", "-").lower() + ".jpg"


def frame_id(src):
    # the camera's own file name, without the export's leading sequence number
    return re.sub(r"^\d+-", "", src.stem).lower()


def save_resized(img, size, dest):
    copy = img.copy()
    copy.thumbnail((size, size), Image.LANCZOS)
    copy.save(dest, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    return copy.size


def main():
    SRC.mkdir(exist_ok=True)
    THUMBS.mkdir(parents=True, exist_ok=True)

    existing = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else []
    by_file = {p["file"]: p for p in existing}

    # photos already in the gallery go first, so a duplicate never replaces one of them
    originals = sorted(
        (p for p in SRC.iterdir() if p.suffix.lower() in EXTS),
        key=lambda p: (output_name(p) not in by_file, p.name),
    )
    if not originals:
        print(f"No photos found in {SRC}")

    built = {}
    taken = {}
    seen = set()
    for src in originals:
        keys = {hashlib.md5(src.read_bytes()).hexdigest(), frame_id(src)}
        if keys & seen:
            print(f"  {src.name} skipped (duplicate)")
            continue
        seen |= keys
        name = output_name(src)
        with Image.open(src) as img:
            taken[name] = date_taken(img)
            img = ImageOps.exif_transpose(img).convert("RGB")
            save_resized(img, FULL_SIZE, OUT / name)
            width, height = save_resized(img, THUMB_SIZE, THUMBS / name)
        entry = by_file.get(name, {"file": name, "category": "", "caption": ""})
        entry.update(width=width, height=height)
        built[name] = entry
        print(f"  {src.name} -> {name}")

    # Keep the existing order/captions, put new photos first, drop removed ones
    new = [e for n, e in built.items() if n not in by_file]
    new.sort(key=lambda e: taken[e["file"]], reverse=True)
    kept = [built[p["file"]] for p in existing if p["file"] in built]
    manifest = new + kept

    for stale in set(by_file) - set(built):
        (OUT / stale).unlink(missing_ok=True)
        (THUMBS / stale).unlink(missing_ok=True)

    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"{len(manifest)} photos in {MANIFEST.relative_to(ROOT)}")

    untagged = [e["file"] for e in manifest if not e.get("category")]
    if untagged:
        print(f"Needs a category (shows under every tab until set): {', '.join(untagged)}")


if __name__ == "__main__":
    main()
