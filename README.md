# ScoutLens

React + TypeScript recruitment interface with a FastAPI ranking API. One Vercel project serves the static frontend and Python function under `/api`. No database or external runtime data service is required.

## Local development

```sh
npm install
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python -m uvicorn backend.app:app --reload
```

In another terminal run `npm run dev` and open http://127.0.0.1:5173. Vite proxies `/api` to port 8000. Interactive API docs: http://127.0.0.1:8000/api/docs.

## Data preparation

The committed `backend/assets/scoutlens.json` is the only dataset required at runtime. Raw downloads are excluded from Git and Vercel uploads. To refresh it locally, keep the downloaded folders under `data/` and run:

```sh
python3 -m scripts.prepare_data
```

The preparation step uses only the standard library. It does not run scripts from the downloaded repository. It joins names and birth years to Transfermarkt metadata, then uses exact normalized names, explicit club aliases, competition, season and club spell to link source statistics. Ambiguous matches are excluded. Minute discrepancies greater than the larger of 180 minutes or 12% are quarantined. Each source supplies its own per-90 denominator. Missing values remain null.

Starting-lineup positions from July 2024 onward determine eligibility where supported (at least three starts and 15% of recorded starts), otherwise the Transfermarkt profile position is used with reduced confidence. This fallback can reflect a newer position than the historical season. Cross-source IDs are not assumed interchangeable.

Valuations use the latest available dated Transfermarkt record, even when evaluating an older season. They are not historical-as-of-season transfer prices. Contract dates and metadata are snapshot values. Existing club exclusions apply to the selected season, not live squad membership. Players with multiple spells appear once, using their best eligible spell score; no season totals are duplicated across club spells. Other-season appearances are shown as context, not weighted into the rank.

## Select from the pitch

Choose a club and season to see eleven recruitment slots in its most recorded formation. Click or keyboard-activate a slot, then choose a compatible role. Separate left and right slots remain individually selectable even where they share a positional benchmark. A compatible existing role is retained; otherwise selection chooses a valid role for that position.

The formation selector offers recorded shapes and sixteen planning templates. Club/season changes reset the formation override. The position dropdown always exposes every supported position, including those outside the displayed formation, and manual selections are marked as custom. Missing formation history shows an explicit unavailable state until a planning shape is selected.

Pitch layouts are schematic, not tracked player locations or current starting lineups. Side labels do not add side-specific ranking rules or constrain preferred foot. Formation does not change the statistical score. The same existing datasets continue to power all five leagues; no extra download is needed for this selector.

Formation integrity checks (requires Node with TypeScript support, such as Node 22.18 or newer): `node --test tests/formation.test.mjs`.

## Ranking

ScoutLens supports 13 position categories (GK, CB, LB, RB, DM, CM, AM, LM, RM, LW, RW, SS, ST) and 26 role profiles. Choose a position first, then one of its compatible roles. Full-backs and wide midfielders can use a wing-back recruitment profile; wing-back experience is not inferred from position alone. Scorecards live in `backend/roles.py`. Benchmarks include one spell per player (the largest qualifying minutes sample). Scores use weighted percentiles against the same position across all five leagues with at least 900 minutes; every required metric must be present. Defaults: 900 minutes, age at most 35. Lower minute searches retain the 900-minute benchmark and report limited evidence.

Ranking: 90% role score and 10% team-possession similarity, defined as `max(0, 100 - 3 × absolute possession difference)`. Without possession context, and for goalkeepers, the role score is used alone. These are explicit product heuristics, not learned success probabilities. Possession does not prove a team's tactical style. Formation is displayed as planning context and does not alter the score. League-strength adjustments, pressure events, progressive carries and passing-under-pressure are not available. EA ratings and wages are not used.

## Charts and interpretation

Search results include a selectable shortlist comparison, team possession versus its league, the three most recorded formations, and the destination club's current role profile. Player evidence panels show three charts together: a radar against positional peers and club incumbents, a scatter plot of individual role performance versus recorded minutes, and an interactive donut showing each metric's contribution to the achieved score. A written explanation identifies higher and lower observed statistics and explains possession context. Charts include accessible text values and work on mobile without a charting-library dependency.

Club profiles use minutes-weighted raw statistics for position-eligible incumbents with at least 450 minutes, then transform those means using the same benchmarks as candidates. Missing metrics remain unavailable; each metric exposes its sample size. A complete team radar polygon is drawn only when every role metric is available. Incumbents describe the existing squad, not an optimal replacement target. Squad coverage counts players in every eligible position, so totals can overlap.

Goalkeeper save percentage is a proxy derived from `saves / (saves + goals conceded)` from the same verified SofaScore spell. It is not adjusted for shot quality and can include goals with no save opportunity. Save volume, claims and successful runs out depend on team exposure. Pressing intensity, recovery speed, off-ball movement, inverted movement and running coverage are not established by these scorecards. Role descriptions disclose those gaps; role labels are recruitment hypotheses rather than validated tactical classifications. Event/location data and goalkeeper post-shot expected goals would improve those assessments.

## Verification

```sh
npm run build
.venv/bin/python -m pytest tests -q
```

## Deploy both parts on Vercel

1. Push this project to a private Git repository, including `backend/assets/scoutlens.json` and `package-lock.json`. Do not commit raw data or `.env` files.
2. Import the repository into Vercel. Choose **Vite** as the framework and the repository root as the root directory. Build: `npm run build`; output: `dist`.
3. Keep `vercel.json`: it routes `/api/*` to the Python ASGI entrypoint, includes the compact runtime snapshot, and excludes raw data and development files. Python 3.12 is specified in `.python-version`.
4. Deploy. No environment variables are required for this snapshot-based version.
5. Verify `/api/health`, `/api/catalog`, and a search in the UI on the deployed domain. Check `/api/docs` if diagnosing API requests.

Python functions are read-only at runtime; data refreshes happen locally and ship with a new deployment. Local build/API/browser checks do not establish successful hosted deployment. Use Vercel's firewall/rate controls for production traffic if needed; the application exposes only read-only public scouting queries with bounded validated inputs.

Data source rights remain with the original providers. The downloaded project's code licence does not license its football data for public redistribution. Confirm source terms before publishing a public/commercial dataset-backed service. Sources: FBref, SofaScore, Understat, Transfermarkt. Prepared data excludes SoFIFA estimates.

For additional event-data downloads and the coverage needed for deeper tactical analysis, see [docs/DATA_DOWNLOADS.md](docs/DATA_DOWNLOADS.md).

### Home and candidate workspace

The home page is at `/`; the scouting workspace is at `/scout`. Navigation supports browser Back/Forward and direct SPA entry. Search results show all eligible candidates in globally ranked pages of 25. The API retains a five-result default for existing callers; `page` (1–1000) and `page_size` (1–50) control pagination. Filters always apply before pagination.

Selecting a table row opens the player's evidence across the full results area and hides the table at every screen size. Back to players or Escape restores the current page and focuses the viewed player's row. Previous/Next buttons and the up/down keyboard keys navigate the global ranking, fetching adjacent pages when necessary. Requests are cancelled on Back, a changed brief, or unmount; errors retain the current profile. Player evidence includes the three existing charts without an accordion. Team charts and the top-five comparison remain available below the results. No additional data is required for this interface.

### Interactive evidence charts

Radar points and metric rows support hover, touch and keyboard inspection; legend buttons toggle club and percentile-50 overlays. Bars expose exact values and source notes on hover/focus and can pin them with click or Enter; Escape dismisses the inspection. The squad scatter plot switches between weighted role score and any role metric, with recorded minutes on the horizontal axis and the same positional benchmarks as candidate ranking. Donut segments show shares of the achieved score, with exact point contributions available through the segments and legend. Player raw statistics use a compact table without progress bars. Individual role scores remain unavailable when any required metric is missing. These comparisons require no additional dataset.

### Two-player comparisons and URLs

Use **Compare player** in a profile to choose a top matching candidate or search by name, including current destination-club players. Empty searches suggest recruitment candidates; named searches and saved comparison IDs use `purpose=comparison` to include current squad players. The recruitment shortlist always uses the default `purpose=recruitment` and excludes them. Search is case- and accent-insensitive, debounced, capped at ten returned candidates and cancellable. Both players use the same season, position, role weights and filters. The comparison provides a shared radar, a minutes-versus-role-score scatter plot, exact recorded numbers and percentile differences, watch points, dated values, and individual score-composition donuts. It does not infer missing tactical traits or compare incompatible positional benchmarks.

`/` is the home page and `/scout` is the workspace. The workspace URL stores the brief (`team_id`, `season`, `role`, `position`, filters and formation), result `page`, selected `player`, and `compare` player. `results=1` restores the search after reload; `compare=pick` opens the picker. Browser Back/Forward restores these states. Invalid filter parameters receive valid defaults; API validation still enforces all constraints. Vercel's existing SPA rewrite supports direct links; a hosted deployment has not been verified.

Validation: `python -m pytest -q` and `node --test tests/scout-url.test.mjs tests/formation.test.mjs`, plus browser checks for choosing/searching, refresh, Back/Forward, page-two links and mobile overflow.
