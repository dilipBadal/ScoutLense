# Player portrait import

The bulk import currently covers **2,952 of 3,290 unique players**. The images
total 48,429,012 bytes (46.2 MiB). There are 336 unresolved identities and two
mapped identities without a portrait in this local pack. Those players keep
their initials. The original 14 GB pack stays untouched.

The source identity tables are [FM 2023](https://github.com/dannytharris/FM/blob/main/FM%202023.csv)
and a [newer FM export](https://github.com/fredGob/FMdataExport/blob/main/DataAnalyser/FM26_Example_data.csv).
Only their identity fields are used; ScoutLens performance statistics and
scoring stay unchanged. No downloaded executable or script was run.

`scripts/map_player_faces.py` first matches normalized names and exact dates of
birth. Abbreviated names require an exact birth date and a unique candidate.
For the newer export, independently matched players establish its game date as
2026-04-27. Additional full names must be unique in both registries, and their
ages must agree with Transfermarkt birth dates on that date. Ambiguities and
duplicate FM identities are rejected. These automated checks are identity
matching evidence; the portraits have not all been manually reviewed.

Audit files live in `docs/face-import/`: `face_mapping.json` records each
match and source; `sources.json` records source checksums; `unresolved_faces.csv`
lists unmatched identities; `import_report.json` lists missing pack faces and
asset totals. These audit reports are committed so checks work from a fresh
clone. Raw identity tables stay in `data/player-identities/` and are excluded from Vercel deployment by the
existing `data/` exclusion. Runtime assets are only the WebP files and the small
frontend ID/name/path manifest.

To reproduce after installing `requirements-images.txt`:

```sh
.venv/bin/python scripts/map_player_faces.py
.venv/bin/python scripts/extract_faces.py --source '/path/to/faces' --skip-missing --write
```

For the remaining players, supply an FM identity CSV/export containing **Unique
ID, name and date of birth**; an explicit Transfermarkt-to-FM ID mapping also
works. The two known missing photos need additions to the face pack itself.

## Original two-player pilot

The pilot used Harry Kane (Transfermarkt 132098, FM 28049320) and Viktor Gyökeres
(Transfermarkt 325443, FM 93070271) are imported. Reviewed ID mappings and their
identity source URLs live in `scripts/face_pilot.json`. FM IDs and Transfermarkt
IDs are different; filenames alone cannot identify the rest of the dataset.

The extractor checks the dataset ID and exact name, reads the pack's config.xml
portrait mapping, checks file confinement, and converts only those listed images
to WebP with transparency. It leaves the source pack untouched. No downloaded
pack scripts are executed.

Install the optional local dependency using `.venv/bin/pip install -r
requirements-images.txt` if Pillow is missing. Preview an import with:

```sh
.venv/bin/python scripts/extract_faces.py --source '/path/to/faces' --mapping scripts/face_pilot.json
```

Add `--write` to write `public/faces/<Transfermarkt ID>.webp` and the frontend
manifest `frontend/src/data/playerFaces.json`. The pilot mapping contains
exactly two people; the default now uses the generated bulk mapping. Future imports require checked ID mappings; the tool does
not guess identities or automatically scan for additional players. A write
replaces the frontend manifest with the supplied mapping, so retain all desired
entries when extending it.

`PlayerAvatar` uses the shared manifest in the shortlist, profile, comparison
picker and comparison cards. Unmapped players and failed images show initials.
Both pilot images are 250 × 250, approximately 30 KB combined, and Vite copies
them into the production build as static assets. The deployed frontend never
reads the FM folder and the API needs no image dependency.
