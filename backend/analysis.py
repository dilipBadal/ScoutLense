"""Descriptive team context; incumbents are a comparison, not an ideal target."""
from backend.benchmarks import distributions, metric_profile
from backend.roles import ROLES, POSITIONS
from backend.store import snapshot


def team_analysis(team, query):
    data = snapshot()
    peers = [t for t in data['teams'] if t['season'] == query.season and t['league'] == team['league']]
    possession = [t['possession'] for t in peers if t['possession'] is not None]
    squad = [p for p in data['players'] if p['team_id'] == team['id'] and p['season'] == query.season]
    incumbents = [p for p in squad if query.position in p['positions'] and p['minutes'] >= 450]
    weights = ROLES[query.role]['weights']
    benchmarks = distributions(query.season, query.position, query.role)
    stats, samples = {}, {}
    for key in weights:
        available = [p for p in incumbents if p['stats'].get(key) is not None]
        total = sum(p['minutes'] for p in available)
        if total and benchmarks[key]:
            stats[key] = sum(p['stats'][key] * p['minutes'] for p in available) / total
            samples[key] = len(available)
    profile = metric_profile(stats, {k: v for k, v in weights.items() if k in stats}, benchmarks)
    for metric in profile:
        metric['sample_players'] = samples[metric['key']]
    complete = len(profile) == len(weights)
    individual = []
    for player in incumbents:
        available_weights = {key: weight for key, weight in weights.items()
                             if player['stats'].get(key) is not None and benchmarks[key]}
        metrics = metric_profile(player['stats'], available_weights, benchmarks)
        score = sum(m['percentile'] * m['weight'] for m in metrics) if len(metrics) == len(weights) else None
        individual.append({'id': player['id'], 'name': player['name'], 'minutes': player['minutes'],
                           'metrics': metrics, 'role_score': round(score, 1) if score is not None else None})
    return {
        'position': query.position, 'position_name': POSITIONS[query.position],
        'incumbents': individual,
        'metrics': profile,
        'role_score': round(sum(m['percentile'] * m['weight'] for m in profile), 1) if complete else None,
        'league_possession': round(sum(possession) / len(possession), 1) if possession else None,
        'league_sample': len(possession),
        'position_coverage': [{'id': key, 'name': name,
                               'players': len({p['id'] for p in squad if key in p['positions']})}
                              for key, name in POSITIONS.items()],
        'note': 'Minutes-weighted incumbent statistics (minimum 450 minutes), measured against the same positional benchmarks. Each metric may use a different sample. This is the existing squad profile, not a desired target. Players may cover multiple positions.',
    }
