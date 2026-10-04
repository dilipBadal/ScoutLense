# Data for deeper player–team fit

The present fit score is mostly a positional role score, with an optional 10% possession-similarity component. It is not a learned transfer-success prediction or a complete tactical fit model. Club incumbents are a reference, not automatically the desired signing profile.

## Download first: StatsBomb Open Data

Official repository: https://github.com/hudl/open-data (the former statsbomb/open-data URL redirects here).

1. Open the repository and choose **Code → Download ZIP**.
2. Extract it and rename the extracted repository folder `statsbomb-open-data`.
3. Place that folder inside ScoutLens's `data/` directory.
4. Preserve `data/competitions.json`, `data/matches/`, `data/events/`, `data/lineups/`, `data/three-sixty/`, `doc/`, and `LICENSE.pdf` in the downloaded repository. `three-sixty` provides spatial context for selected matches; it is optional for ordinary event maps.

Expected example: `data/statsbomb-open-data/data/competitions.json`.

The event files can support pass maps, pass-reception maps, shot maps with recorded xG, defensive-action maps, and derived passing networks where recipient information is available. Derived progression, territory, possession sequences and pressure statistics require explicit definitions and comparable exposure denominators.

Coverage is selective, not every match of every competition. The competition index checked on 4 October 2026 does not list 2024/25 or 2025/26 top-five domestic seasons. Availability must also be checked at match level; a listed competition does not promise its complete season. Historical club matches and international appearances must retain their original context and cannot become current-club tactical evidence. Public analysis requires StatsBomb attribution under the repository's terms.

Competition index: https://raw.githubusercontent.com/statsbomb/open-data/master/data/competitions.json

## Optional second: Wyscout public soccer event dataset

Original collection: https://figshare.com/collections/Soccer_match_event_dataset/4415000

Download the **Events**, **Matches**, **Players**, **Teams** and **Competitions** items from this collection. Extract archives into `data/wyscout-open-data/`, preserving the original filenames. Referees and coaches are optional.

This covers all five major domestic leagues in **2017/18**, plus the included international tournaments. It is useful for a broad historical event-analysis mode and validating methods; it cannot establish how today's squads play.

Primary dataset paper: https://www.nature.com/articles/s41597-019-0247-7

## Do not prioritise tracking demos for current scouting

Metrica's sample games are anonymised. SkillCorner's currently published sample concerns Australian A-League matches in 2024/25, plus season aggregates. Neither fills current top-five club coverage.

- https://github.com/metrica-sports/sample-data
- https://github.com/SkillCorner/opendata

## What each chart needs

| View | Required observations | Current coverage |
| --- | --- | --- |
| Role radar, incumbent differences, score contributions | Verified season aggregates | Implemented |
| Player passing / receiving maps | Event coordinates, outcomes, player identities | Missing across the general scouting pool |
| Passing network and build-up connections | Pass recipients, lineups, match minutes | Missing across the general scouting pool |
| Shot location and chance quality | Shot coordinates, xG, outcomes | Existing downloaded shot data is limited to specific subsets, such as Barcelona |
| Defensive and pressure zones | Located defensive/pressure events, timestamps | Missing across the general scouting pool |
| Match-by-match consistency | Player-match statistics and minutes over a meaningful sample | Existing match data is limited to subsets |
| Off-ball runs, formation occupation and recovery movement | Reliable tracking or suitable spatial observations | Missing across the general scouting pool |

Each future panel should disclose source, season, competition, number of matches, minutes and unavailable measurements. Map density is not quality, incumbent differences are not predicted transfer effects, and similar possession does not imply similar tactics.

For comprehensive current-season event analysis across all five leagues, we need a provider dataset with explicit competition, season, match and field coverage, such as licensed Hudl/StatsBomb, Wyscout or Opta data. The free sources above do not supply that complete coverage. Raw events stay local and out of the Vercel bundle; deploy compact prepared chart summaries.

These additional datasets are **not integrated yet**. Inspect their actual coverage before adding new tactical scoring terms.
