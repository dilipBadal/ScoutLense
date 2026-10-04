# ScoutLens data and methodology

Prepared 2026-10-04. 3290 distinct players, 5246 player-club-season records, 110 clubs, 2952 matched portraits. Seasons: 2024/25 and 2025/26; Premier League, La Liga, Serie A, Bundesliga, Ligue 1. Counts precede search filters. Preparation date is not the collection date of every source.

## Sources and licensing

### Top-five football dataset

m-mahadi · FBref, SofaScore and Understat

FBref-derived player-season identities, ages, minutes and team possession; SofaScore passing, defending, shooting, duels and goalkeeper statistics; Understat non-penalty expected goals and expected assists.

License and rights: MIT applies to the repository’s code only. The football data is explicitly excluded from MIT; each original provider retains its rights. The source describes research and educational use and does not grant redistribution or commercial rights.

- [Dataset repository](https://github.com/m-mahadi/top5-football-dataset)
- [License & data notice](https://github.com/m-mahadi/top5-football-dataset/blob/master/LICENSE)
- [FBref](https://fbref.com/)
- [SofaScore](https://www.sofascore.com/)
- [Understat](https://understat.com/)

### Transfermarkt datasets

David Caribou · dcaribou/transfermarkt-datasets

Player identities, preferred foot, profile positions, contracts, dated market values and club IDs. Match formations and starting-lineup records provide historical formation context and position eligibility.

License and rights: The dataset project publishes a CC0 1.0 license. This describes the publisher’s dedication; it does not change third-party rights in the underlying Transfermarkt material.

- [Dataset repository](https://github.com/dcaribou/transfermarkt-datasets)
- [Kaggle download](https://www.kaggle.com/datasets/davidcariboo/player-scores)
- [CC0 license](https://github.com/dcaribou/transfermarkt-datasets/blob/master/LICENSE)
- [Transfermarkt](https://www.transfermarkt.com/)

### Player portraits & identity matching

Local Football Manager face pack · public FM identity files

A subset of the locally supplied Football Manager 2024 face pack is displayed as WebP portraits. Public FM 2023 and FM26 example files help map FM IDs to real player identities. Game attributes are never used in ScoutLens scores.

License and rights: Portrait and identity-file reuse rights have not been verified. Downloading a face pack does not establish redistribution rights. ScoutLens claims no ownership of the photos and does not assign them the application’s code license. Players without a matched portrait use initials.

- [FM 2023 identity file](https://github.com/dannytharris/FM/blob/main/FM%202023.csv)
- [FM26 identity file](https://github.com/fredGob/FMdataExport/blob/main/DataAnalyser/FM26_Example_data.csv)
- [Import audit](https://github.com/dilipBadal/ScoutLense/tree/main/docs/face-import)

## Preparation and scoring

### Match identities carefully

Names and birth years link players to metadata. Normalized names, explicit club aliases, competition, season and club spells link statistics. Ambiguous matches are excluded.

### Keep missing data visible

Missing values remain unavailable. Source-minute discrepancies greater than the larger of 180 minutes or 12% are quarantined. Per-90 rates use each source’s own recorded minutes.

### Compare like positions

Role metrics are weighted percentiles against players at the same position across all five leagues with at least 900 minutes. Every required metric must be available. Lower-minute candidates keep the same benchmark.

### Explain the final score

Fit is 90% role score and 10% team-possession similarity. Similarity is max(0, 100 − 3 × absolute possession difference). Goalkeepers and players without possession context use the role score alone. Formation does not change the score.

## Quality

447 unresolved metadata records excluded. 78 SofaScore and 99 Understat minute conflicts quarantined. Verified joins: 4220 SofaScore and 4480 Understat records; these counts overlap.

The separately downloaded Kaggle player-stat CSV, SoFIFA/EA ratings and wages are not used in scoring. StatsBomb and Wyscout event data are not integrated. Portraits do not influence rankings.

## Limitations

- Fit scores are product heuristics, not probabilities of transfer success. Role labels describe recruitment briefs; they do not prove a player’s tactical behavior.
- This is a historical snapshot for 2024/25 and 2025/26, not a live squad feed. The preparation date is not the collection date of every source.
- Market values use the latest available dated record, including when viewing an older season. They are estimates, not asking prices or historical-as-of-season valuations. Contract details are snapshot values.
- Starting positions require at least three starts and 15% of recorded starts; otherwise the profile position is used with lower confidence. Pitch slots are schematic, not tracked locations.
- Pressures, off-ball runs, passing under pressure, progressive carries and tracking data are unavailable across the scouting pool. There is no league-strength adjustment. Possession similarity does not establish tactical compatibility.
- Goalkeeper save percentage uses saves divided by saves plus goals conceded. It is a proxy without shot-quality adjustment. Club comparisons describe incumbent performance, not an ideal replacement target.

## Corrections

[Contact Dilip](mailto:workwithdilip1@gmail.com) for data corrections or attribution questions. ScoutLens grants no blanket license to the combined data or photographs.
