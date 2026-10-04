import json
from datetime import date
from pathlib import Path

from PIL import Image

from scripts.map_player_faces import age_on, normalized, abbreviated_name_matches

ROOT = Path(__file__).resolve().parents[1]


def test_name_normalization_and_birth_date_boundaries():
    assert normalized("Filip Jørgensen") == normalized("FILIP Jörgensen")
    assert normalized("Viktor Gyökeres") == normalized("viktor gyokeres")
    assert age_on(date(2002, 4, 28), date(2026, 4, 27)) == 23
    assert age_on(date(2002, 4, 27), date(2026, 4, 27)) == 24
    assert abbreviated_name_matches("Ben White", "Benjamin White")
    assert not abbreviated_name_matches("Ben White", "Brian Smith")
    assert not abbreviated_name_matches("Pedro", "João Pedro")


def test_imported_portraits_have_unique_auditable_identities_and_valid_assets():
    mapping = json.loads((ROOT / "docs/face-import/face_mapping.json").read_text())
    manifest = json.loads((ROOT / "frontend/src/data/playerFaces.json").read_text())
    report = json.loads((ROOT / "docs/face-import/import_report.json").read_text())
    dataset = json.loads((ROOT / "backend/assets/scoutlens.json").read_text())
    names = {(str(p["id"]), p["name"]) for p in dataset["players"]}
    entries = {p["player_id"]: p for p in mapping}
    assert len(entries) == len(mapping) == len({p["fm_id"] for p in mapping})
    assert report["imported_players"] == len(manifest)
    assert len(manifest) + len(report["missing_pack_faces"]) == len(mapping)
    assert {"132098", "325443"}.issubset(manifest)
    for player_id, face in manifest.items():
        assert (player_id, face["name"]) in names
        assert entries[player_id]["date_of_birth"]
        assert entries[player_id]["identity_source"].startswith("https://github.com/")
        assert face["src"] == f"/faces/{player_id}.webp"
        with Image.open(ROOT / "public" / face["src"].lstrip("/")) as image:
            assert image.format == "WEBP" and image.mode == "RGBA"
            assert max(image.size) <= 250
    paths = list((ROOT / "public/faces").glob("*.webp"))
    assert len(paths) == len(manifest)
    assert sum(path.stat().st_size for path in paths) == report["total_bytes"]
