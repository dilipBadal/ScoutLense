"""Match player identities using normalized names plus exact dates of birth."""
import csv
import gzip
import json
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_URL = "https://github.com/dannytharris/FM/blob/main/FM%202023.csv"
NEW_SOURCE_URL = "https://github.com/fredGob/FMdataExport/blob/main/DataAnalyser/FM26_Example_data.csv"


def birthday_in_year(dob, year):
    try:
        return dob.replace(year=year)
    except ValueError:
        return date(year, 2, 28)


def age_on(dob, day):
    return day.year - dob.year - (day < birthday_in_year(dob, day.year))


def newer_matches(mapping, unresolved, metadata):
    with (ROOT / "data/player-identities/fm26-example.csv").open(encoding="utf-8-sig") as stream:
        rows = list(csv.DictReader(stream))
    by_id = {r["Unique ID"]: r for r in rows}
    # Infer the export's game date from all independently matched birth dates.
    starts, ends = [], []
    for entry in mapping:
        row = by_id.get(entry["fm_id"])
        if row is None or normalized(row["Joueur"]) != normalized(entry["fm_name"]):
            continue
        dob = date.fromisoformat(entry["date_of_birth"])
        age = int(row["Âge"])
        starts.append(birthday_in_year(dob, dob.year + age))
        ends.append(birthday_in_year(dob, dob.year + age + 1))
    lower, upper = max(starts), min(ends)
    if len(starts) < 100 or (upper - lower).days != 1:
        raise ValueError("Cannot establish one consistent export date from verified identities")
    index = defaultdict(dict)
    for row in rows:
        index[(normalized(row["Joueur"]), int(row["Âge"]))][row["Unique ID"]] = row
    tm_index = defaultdict(set)
    for player_id, meta in metadata.items():
        if not meta["date_of_birth"]:
            continue
        age = age_on(date.fromisoformat(meta["date_of_birth"][:10]), lower)
        for alias in [meta["name"], f"{meta['first_name']} {meta['last_name']}"]:
            tm_index[(normalized(alias), age)].add(player_id)
    remaining = []
    for entry in unresolved:
        meta = metadata[entry["player_id"]]
        if not entry["date_of_birth"]:
            remaining.append(entry)
            continue
        age = age_on(date.fromisoformat(entry["date_of_birth"]), lower)
        aliases = {entry["name"], meta["name"], f"{meta['first_name']} {meta['last_name']}"}
        hits = {}
        for alias in aliases:
            name = normalized(alias)
            # Require a full name and no same-name/age collision in either registry.
            if len(name.split()) >= 2 and tm_index.get((name, age)) == {entry["player_id"]}:
                hits.update(index.get((name, age), {}))
        if len(hits) != 1:
            remaining.append(entry)
            continue
        fm_id, row = next(iter(hits.items()))
        mapping.append({"player_id": entry["player_id"], "name": entry["name"],
                        "fm_id": fm_id, "date_of_birth": entry["date_of_birth"],
                        "fm_name": row["Joueur"], "export_date": lower.isoformat(),
                        "match_method": "unique_full_name_and_dob_consistent_age",
                        "identity_source": NEW_SOURCE_URL})
    print(f"Newer export date: {lower}; independently matched date anchors: {len(starts)}")
    return mapping, remaining


def normalized(value):
    folded = unicodedata.normalize("NFKD", value.casefold().translate(
        str.maketrans({"ø": "o", "ł": "l", "đ": "d", "ð": "d", "þ": "th"})
    ))
    return " ".join(re.sub(r"[^\w\s]", " ", "".join(
        c for c in folded if not unicodedata.combining(c)
    )).split())


def abbreviated_name_matches(alias, full_name):
    tokens, other = normalized(alias).split(), normalized(full_name).split()
    return len(tokens) >= 2 and len(other) >= 2 and (
        (tokens[-1] == other[-1] and tokens[0][0] == other[0][0])
        or other[:len(tokens)] == tokens
    )


def build_mapping():
    with (ROOT / "data/player-identities/fm2023.csv").open(encoding="utf-8-sig") as stream:
        fm = list(csv.DictReader(stream))
    with gzip.open(ROOT / "data/transfermarkt-datasets/players.csv.gz", "rt") as stream:
        metadata = {p["player_id"]: p for p in csv.DictReader(stream)}
    data = json.loads((ROOT / "backend/assets/scoutlens.json").read_text())
    players = {p["id"]: p for p in data["players"]}
    index = defaultdict(dict)
    by_dob = defaultdict(dict)
    for row in fm:
        year, month, day = map(int, row["Date of birth"].split("/"))
        dob = date(year, month, day).isoformat()
        index[(normalized(row["Name"]), dob)][row["UID"]] = row
        by_dob[dob][row["UID"]] = row
    mapping, unresolved = [], []
    for player_id, player in players.items():
        meta = metadata[player_id]
        dob = meta["date_of_birth"][:10]
        aliases = {player["name"], meta["name"], f"{meta['first_name']} {meta['last_name']}"}
        hits = {}
        for alias in aliases:
            hits.update(index.get((normalized(alias), dob), {}))
        match_method = "unique_normalized_name_and_exact_dob"
        if not hits:
            match_method = "unique_abbreviated_name_and_exact_dob"
            # Expand abbreviated names only with an exact birth-date anchor.
            for alias in aliases:
                for fm_id, row in by_dob.get(dob, {}).items():
                    if abbreviated_name_matches(alias, row["Name"]):
                        hits[fm_id] = row
        if len(hits) != 1:
            unresolved.append({"player_id": player_id, "name": player["name"],
                               "date_of_birth": dob,
                               "reason": "ambiguous_identity" if hits else "no_verified_fm_identity"})
            continue
        fm_id, row = next(iter(hits.items()))
        mapping.append({"player_id": player_id, "name": player["name"], "fm_id": fm_id,
                        "date_of_birth": dob, "fm_name": row["Name"],
                        "match_method": match_method,
                        "identity_source": SOURCE_URL})
    mapping, unresolved = newer_matches(mapping, unresolved, metadata)
    # Never assign one FM identity to two Transfermarkt players.
    counts = Counter(entry["fm_id"] for entry in mapping)
    safe = []
    for entry in mapping:
        if counts[entry["fm_id"]] == 1:
            safe.append(entry)
        else:
            unresolved.append({"player_id": entry["player_id"], "name": entry["name"],
                               "date_of_birth": entry["date_of_birth"], "reason": "duplicate_fm_identity"})
    output = ROOT / "docs/face-import"
    output.mkdir(parents=True, exist_ok=True)
    (output / "face_mapping.json").write_text(json.dumps(safe, ensure_ascii=False, indent=2) + "\n")
    with (output / "unresolved_faces.csv").open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=["player_id", "name", "date_of_birth", "reason"])
        writer.writeheader()
        writer.writerows(unresolved)
    print(f"Dataset: {len(players)} players; verified mappings: {len(safe)}; unresolved: {len(unresolved)}")


if __name__ == "__main__":
    build_mapping()
