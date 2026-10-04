"""Extract only explicitly mapped portraits from a local Football Manager pack."""
import argparse
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def extract(source: Path, mapping: Path, write: bool, skip_missing: bool = False) -> None:
    source = source.resolve(strict=True)
    entries = json.loads(mapping.read_text())
    snapshot = json.loads((ROOT / "backend/assets/scoutlens.json").read_text())
    identities = {(str(p["id"]), p["name"]) for p in snapshot["players"]}
    targets = {}
    player_ids = set()
    for entry in entries:
        player_id, fm_id = entry["player_id"], entry["fm_id"]
        if not re.fullmatch(r"[0-9]{1,15}", player_id) or not re.fullmatch(r"[0-9]{1,15}", fm_id):
            raise ValueError("Player IDs must be numeric")
        if (player_id, entry["name"]) not in identities:
            raise ValueError(f"Dataset identity mismatch: {entry['name']}")
        if fm_id in targets or player_id in player_ids:
            raise ValueError("Duplicate mapping")
        player_ids.add(player_id)
        targets[fm_id] = entry

    found = {}
    for _, node in ET.iterparse(source / "config.xml", events=("end",)):
        destination = node.get("to", "")
        match = re.fullmatch(r"graphics/pictures/person/([0-9]+)/portrait", destination)
        if match and match[1] in targets:
            fm_id = match[1]
            filename = node.get("from", "")
            if not re.fullmatch(r"[A-Za-z0-9_-]+", filename):
                raise ValueError("Unsafe source filename")
            path = (source / f"{filename}.png").resolve()
            if path.parent != source:
                raise ValueError("Portrait must stay inside the face pack")
            if fm_id in found and found[fm_id] != path:
                raise ValueError(f"Ambiguous portrait mapping for {fm_id}")
            if path.is_file():
                found[fm_id] = path
        node.clear()
    missing = set(targets) - set(found)
    if missing and not skip_missing:
        raise ValueError(f"Missing FM portraits: {missing}")

    # Validate and encode every image before writing any output.
    import io
    encoded, manifest = {}, {}
    for fm_id, entry in targets.items():
        if fm_id not in found:
            continue
        with Image.open(found[fm_id]) as image:
            if image.format != "PNG" or max(image.size) > 4096:
                raise ValueError("Expected a small PNG portrait")
            portrait = image.convert("RGBA")
            portrait.thumbnail((250, 250), Image.Resampling.LANCZOS)
            buffer = io.BytesIO()
            portrait.save(buffer, format="WEBP", quality=90, method=3)
        filename = f"{entry['player_id']}.webp"
        encoded[filename] = buffer.getvalue()
        manifest[entry["player_id"]] = {
            "name": entry["name"], "src": f"/faces/{filename}",
        }
        print(f"{entry['name']}: {found[fm_id].stat().st_size:,} → {len(encoded[filename]):,} bytes")
    if write:
        output = ROOT / "public/faces"
        output.mkdir(parents=True, exist_ok=True)
        for filename, content in encoded.items():
            (output / filename).write_bytes(content)
        manifest_path = ROOT / "frontend/src/data/playerFaces.json"
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
        report = {"mapped_players": len(entries), "imported_players": len(manifest),
                  "total_bytes": sum(map(len, encoded.values())),
                  "missing_pack_faces": [targets[fm_id] for fm_id in sorted(missing)]}
        (ROOT / "docs/face-import").mkdir(parents=True, exist_ok=True)
        (ROOT / "docs/face-import/import_report.json").write_text(
            json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"{'Imported' if write else 'Dry run:'} {len(manifest)} portraits; {len(missing)} missing pack files")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="Faces folder containing config.xml")
    parser.add_argument("--mapping", type=Path, default=ROOT / "docs/face-import/face_mapping.json")
    parser.add_argument("--write", action="store_true", help="Write portraits and frontend manifest")
    parser.add_argument("--skip-missing", action="store_true", help="Report unavailable pack portraits and import the rest")
    args = parser.parse_args()
    extract(args.source, args.mapping, args.write, args.skip_missing)
