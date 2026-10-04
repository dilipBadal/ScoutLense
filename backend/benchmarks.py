"""Shared positional benchmarks for ranking and visual comparisons."""
from bisect import bisect_left, bisect_right
from functools import lru_cache
from backend.roles import METRICS, ROLES
from backend.store import snapshot


def percentile(value, values):
    if len(values) < 2:
        return 50.0
    return max(0, min(100, 100 * (bisect_left(values, value) + bisect_right(values, value) - 1) / (2 * (len(values) - 1))))


@lru_cache(maxsize=256)
def distributions(season, position, role):
    spells = sorted((p for p in snapshot()['players'] if p['season'] == season and position in p['positions'] and p['minutes'] >= 900), key=lambda p: -p['minutes'])
    unique = {}
    for player in spells:
        unique.setdefault(player['id'], player)
    return {key: sorted(p['stats'][key] for p in unique.values() if p['stats'].get(key) is not None)
            for key in ROLES[role]['weights']}


def metric_profile(stats, weights, benchmarks):
    return [{'key': key, 'label': METRICS[key][0], 'unit': METRICS[key][1],
             'value': stats[key], 'percentile': round(percentile(stats[key], benchmarks[key]), 1),
             'weight': weight, 'benchmark_count': len(benchmarks[key])}
            for key, weight in weights.items()]
