"""Prepare a small, auditable runtime snapshot without running downloaded scripts."""
import json
from collections import Counter, defaultdict
from datetime import date
from scripts.data_utils import ROOT, SOURCE, TM, LEAGUES, club_key, norm, number, read, unique_index, unique_match

METRICS = {'passes': 'accuratePasses', 'pass_accuracy': 'accuratePassesPercentage',
 'final_third_passes': 'accurateFinalThirdPasses', 'key_passes': 'keyPasses',
 'big_chances': 'bigChancesCreated', 'dribbles': 'successfulDribbles', 'tackles': 'tacklesWon',
 'interceptions': 'interceptions', 'recoveries': 'ballRecovery', 'clearances': 'clearances',
 'aerial_win': 'aerialDuelsWonPercentage', 'aerials': 'aerialDuelsWon',
 'ground_win': 'groundDuelsWonPercentage', 'long_accuracy': 'accurateLongBallsPercentage',
 'crosses': 'accurateCrosses', 'losses': 'possessionLost', 'shots': 'totalShots',
 'saves': 'saves', 'conceded': 'goalsConceded', 'claims': 'highClaims',
 'sweeps': 'successfulRunsOut', 'save_pct': None, 'npxg': None, 'xa': None}
RATIOS = {'pass_accuracy', 'aerial_win', 'ground_win', 'long_accuracy'}
POSITIONS = {'Centre-Back': 'CB', 'Centre-Forward': 'ST', 'Second Striker': 'SS',
             'Central Midfield': 'CM', 'Attacking Midfield': 'AM', 'Defensive Midfield': 'DM',
             'Left Winger': 'LW', 'Right Winger': 'RW', 'Left-Back': 'LB', 'Right-Back': 'RB', 'Goalkeeper': 'GK',
             'Left Midfield': 'LM', 'Right Midfield': 'RM'}


def prepare():
    base = list(read(SOURCE / 'master/player_seasons.csv'))
    people = list(read(TM / 'players.csv.gz'))
    metadata = unique_index(people, lambda r: (norm(r['name']), r['date_of_birth'][:4]))
    sofascore = unique_index(read(SOURCE / 'clean/sofascore_player_seasons.csv'),
                            lambda r: (norm(r['player']), r['league'], r['season'], club_key(r['team'])))
    understat = unique_index(read(SOURCE / 'clean/understat_players.csv'),
                            lambda r: (norm(r['player']), r['league'], r['season'], club_key(r['team'])))
    valuations = {}
    for r in read(TM / 'player_valuations.csv.gz'):
        if r['date'] <= date.today().isoformat() and (r['player_id'] not in valuations or r['date'] > valuations[r['player_id']]['date']):
            valuations[r['player_id']] = r
    clubs = list(read(TM / 'clubs.csv.gz'))
    club_index = unique_index(clubs, lambda r: (club_key(r['name']), r['domestic_competition_id']))
    teams = []
    for r in read(SOURCE / 'clean/teams/standard.csv'):
        if r['league'] not in LEAGUES:
            continue
        tm = unique_match(club_index, [(club_key(r['team']), LEAGUES[r['league']][1])])
        teams.append({'id': f"{r['league']}:{club_key(r['team'])}", 'name': r['team'], 'league': r['league'],
                      'season': r['season'], 'possession': number(r['poss']), 'tm_id': tm['club_id'] if tm else None})
    # Use historically observed starting positions where available, rather than current-club assumptions.
    positions = defaultdict(Counter)
    for r in read(TM / 'game_lineups.csv.gz'):
        if r['date'] >= '2024-07-01' and r['type'] == 'starting_lineup' and r['position'] in POSITIONS:
            season = '2425' if r['date'] < '2025-07-01' else '2526'
            positions[(r['player_id'], season)][POSITIONS[r['position']]] += 1
    formations = defaultdict(Counter)
    formation_dates = {}
    for r in read(TM / 'games.csv.gz'):
        if r['competition_id'] not in {v[1] for v in LEAGUES.values()} or r['season'] not in ['2024', '2025']:
            continue
        season = '2425' if r['season'] == '2024' else '2526'
        for side in ['home', 'away']:
            key = (r[f'{side}_club_id'], season)
            if r[f'{side}_club_formation']:
                formations[key][r[f'{side}_club_formation']] += 1
                formation_dates[key] = max(formation_dates.get(key, ''), r['date'])
    for team in teams:
        key = (team['tm_id'], team['season'])
        team['formations'] = [{'name': name, 'matches': count} for name, count in formations[key].most_common(3)]
        team['formation_date'] = formation_dates.get(key)
    players, report = [], Counter()
    for r in base:
        born = str(int(float(r['born']))) if number(r['born']) else ''
        tm = unique_match(metadata, [(norm(r['player']), born)])
        if not tm:
            report['unresolved_metadata'] += 1
            continue
        names = {norm(r['player']), norm(tm['name'])}
        keys = [(name, r['league'], r['season'], club_key(r['team'])) for name in names]
        ss = unique_match(sofascore, keys)
        us = unique_match(understat, keys)
        minutes = number(r['playing_time_min']) or 0
        # Large discrepancies are quarantined, not treated as equivalent measurements.
        if ss and abs((number(ss['minutesPlayed']) or 0) - minutes) > max(180, minutes * .12):
            ss = None
            report['sofascore_minutes_quarantined'] += 1
        if us and abs((number(us['minutes']) or 0) - minutes) > max(180, minutes * .12):
            us = None
            report['understat_minutes_quarantined'] += 1
        stats = {}
        for key, source in METRICS.items():
            value = number(ss.get(source)) if ss and source else None
            denom = (number(ss['minutesPlayed']) or 0) / 90 if ss else 0
            stats[key] = round(value if key in RATIOS else value / denom, 3) if value is not None and denom else None
        if ss:
            saves, conceded = number(ss['saves']), number(ss['goalsConceded'])
            if saves is not None and conceded is not None and saves + conceded > 0:
                stats['save_pct'] = round(100 * saves / (saves + conceded), 3)
        if us and (number(us['minutes']) or 0) > 0:
            for key, source in [('npxg', 'np_xg'), ('xa', 'xa')]:
                value = number(us[source])
                stats[key] = round(value * 90 / float(us['minutes']), 3) if value is not None else None
        observed = positions.get((tm['player_id'], r['season']), Counter())
        eligible = [p for p, count in observed.items() if count >= 3 and count >= sum(observed.values()) * .15]
        observed_eligibility = bool(eligible)
        fallback = POSITIONS.get(tm['sub_position'])
        if not eligible and fallback:
            eligible = [fallback]
        value = valuations.get(tm['player_id'])
        players.append({'id': tm['player_id'], 'name': r['player'], 'team': r['team'],
          'team_id': f"{r['league']}:{club_key(r['team'])}", 'league': r['league'], 'season': r['season'],
          'age': number(r['age']), 'minutes': int(minutes), 'positions': eligible,
          'position_source': 'Observed starts' if observed_eligibility else 'Profile position',
          'foot': tm['foot'] or None, 'value': number(value['market_value_in_eur']) if value else None,
          'value_date': value['date'] if value else None, 'contract': tm['contract_expiration_date'][:10] or None,
          'stats': stats, 'sources': [name for name, hit in [('SofaScore', ss), ('Understat', us)] if hit]})
        report['sofascore_matched'] += bool(ss)
        report['understat_matched'] += bool(us)
    snapshot = {'players': players, 'teams': teams, 'report': dict(report), 'prepared_at': date.today().isoformat(),
                'seasons': [{'id': '2526', 'name': '2025/26'}, {'id': '2425', 'name': '2024/25'}],
                'leagues': [{'id': key, 'name': val[0]} for key, val in LEAGUES.items()]}
    target = ROOT / 'backend/assets/scoutlens.json'
    target.write_text(json.dumps(snapshot, separators=(',', ':'), allow_nan=False))
    print(json.dumps({'player_spells': len(players), 'team_seasons': len(teams), 'bytes': target.stat().st_size, **report}, indent=2))


if __name__ == '__main__':
    prepare()
