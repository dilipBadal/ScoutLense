import unicodedata
"""Ranking on comparable positions with essential-metric gating and separate confidence."""
from backend.roles import ROLES
from backend.store import snapshot
from backend.benchmarks import percentile, distributions, metric_profile
from backend.analysis import team_analysis


def recommend(query):
    data = snapshot()
    target = next((t for t in data['teams'] if t['id'] == query.team_id and t['season'] == query.season), None)
    if target is None:
        raise ValueError('Club not found in the selected season.')
    team_lookup = {t['id']: t for t in data['teams'] if t['season'] == query.season}
    weights = ROLES[query.role]['weights']
    benchmarks = distributions(query.season, query.position, query.role)
    destination_ids = {p['id'] for p in data['players'] if p['season'] == query.season and p['team_id'] == query.team_id}
    history = {}
    for p in data['players']:
        history.setdefault(p['id'], []).append(p)
    results, excluded = [], {'missing_metrics': 0, 'filters': 0}
    for p in data['players']:
        if (p['season'] != query.season or query.position not in p['positions']
            or (query.purpose == 'recruitment' and p['id'] in destination_ids)):
            continue
        if (p['minutes'] < query.min_minutes or p['age'] is None or p['age'] > query.max_age
            or (query.foot != 'any' and p['foot'] != query.foot)
            or (query.max_value is not None and (p['value'] is None or p['value'] > query.max_value))):
            excluded['filters'] += 1
            continue
        if any(p['stats'][key] is None or not benchmarks[key] for key in weights):
            excluded['missing_metrics'] += 1
            continue
        metrics = metric_profile(p['stats'], weights, benchmarks)
        role_score = sum(m['percentile'] * m['weight'] for m in metrics)
        origin = team_lookup.get(p['team_id'])
        context = None
        if query.position != 'GK' and origin and origin['possession'] is not None and target['possession'] is not None:
            context = max(0, 100 - abs(origin['possession'] - target['possession']) * 3)
        score = role_score if context is None else .9 * role_score + .1 * context
        ordered = sorted(metrics, key=lambda m: m['percentile'], reverse=True)
        confidence = 'High' if p['minutes'] >= 1800 and len(p['sources']) >= 2 and p['position_source'] == 'Observed starts' else 'Moderate'
        if p['minutes'] < 900:
            confidence = 'Limited'
        results.append({**p, 'score': round(score, 1), 'role_score': round(role_score, 1),
          'compatibility': round(context, 1) if context is not None else None,
          'confidence': confidence, 'metrics': metrics,
          'reasons': [f"{m['label']}: percentile {m['percentile']:.0f}" for m in ordered[:3]],
          'tradeoff': f"{ordered[-1]['label']}: percentile {ordered[-1]['percentile']:.0f}",
          'history': [{'season': x['season'], 'team': x['team'], 'minutes': x['minutes']}
                      for x in history[p['id']] if x['season'] != p['season']]})
    results.sort(key=lambda p: (-p['score'], -p['minutes'], p['id']))
    dedup = {}
    for p in results:
        dedup.setdefault(p['id'], p)
    def normalized(value):
        return ''.join(c for c in unicodedata.normalize('NFKD', value.casefold()) if not unicodedata.combining(c))
    needle = normalized(query.name.strip())
    matching = [p for p in dedup.values() if (not needle or needle in normalized(p['name']))
                and (query.player_id is None or p['id'] == query.player_id)]
    start = (query.page - 1) * query.page_size
    return {'pagination': {'page': query.page, 'page_size': query.page_size,
                           'pages': (len(matching) + query.page_size - 1) // query.page_size},
            'players': matching[start:start + query.page_size], 'eligible': len(matching), 'excluded': excluded,
            'team': target, 'team_analysis': team_analysis(target, query), 'query': query.model_dump(), 'benchmark': 'Same position across the five leagues; minimum 900 minutes',
            'method': '90% weighted role percentiles + 10% possession-context similarity. Without possession context, and for goalkeepers, role percentiles alone determine the score. Compatibility is a limited heuristic, not a tactical prediction.',
            'formation': query.formation or (target['formations'][0]['name'] if target['formations'] else None)}
