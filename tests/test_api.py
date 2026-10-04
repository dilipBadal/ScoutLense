import json
from fastapi.testclient import TestClient
from backend.app import app
from backend.ranking import percentile
from backend.store import snapshot
from backend.roles import ROLES, POSITIONS

client = TestClient(app)


def brief(**patch):
    return {'team_id': 'ENG-Premier League:arsenal', 'role': 'goalscorer', 'position': 'ST', **patch}


def test_catalog_and_health():
    assert client.get('/api/health').json()['status'] == 'ok'
    catalog = client.get('/api/catalog').json()
    assert len([t for t in catalog['teams'] if t['season'] == '2526']) == 96
    assert len(catalog['roles']) == 26
    assert len(catalog['positions']) == 13
    assert set(POSITIONS) == {p for r in ROLES.values() for p in r['positions']}


def test_all_roles_produce_real_unique_candidates():
    for role, position in [(key, pos) for key, r in ROLES.items() for pos in r['positions']]:
        response = client.post('/api/recommendations', json=brief(role=role, position=position))
        assert response.status_code == 200
        result = response.json()
        assert len(result['players']) == 5
        assert len({p['id'] for p in result['players']}) == 5
        scores = [p['score'] for p in result['players']]
        assert scores == sorted(scores, reverse=True)
        for player in result['players']:
            assert player['team_id'] != result['query']['team_id']
            assert player['minutes'] >= 900
            assert all(m['value'] is not None for m in player['metrics'])
            assert 0 <= player['score'] <= 100


def test_filters_are_enforced_on_server():
    result = client.post('/api/recommendations', json=brief(max_age=23, max_value=30000000, foot='left')).json()
    for player in result['players']:
        assert player['age'] <= 23
        assert player['value'] is not None and player['value'] <= 30000000
        assert player['foot'] == 'left'
    assert client.post('/api/recommendations', json=brief(max_value=0)).json()['players'] == []


def test_invalid_requests_rejected():
    for patch in [{'min_minutes': -1}, {'max_age': 200}, {'position': 'CB'}, {'role': 'unknown'}, {'position': 'ZZ'}, {'team_id': '../private'}, {'formation': '4-4-4'}, {'unexpected_field': True}]:
        assert client.post('/api/recommendations', json=brief(**patch)).status_code == 422


def test_formation_does_not_invent_tactical_evidence():
    first = client.post('/api/recommendations', json=brief(formation='4-3-3')).json()
    second = client.post('/api/recommendations', json=brief(formation='3-5-2')).json()
    assert [p['score'] for p in first['players']] == [p['score'] for p in second['players']]


def test_wrong_club_source_attachment_removed():
    for player in snapshot()['players']:
        if player['name'] == 'Scott McTominay' and player['team'] == 'Napoli' and player['season'] == '2425':
            assert player['stats']['passes'] is None  # Raw source has no verified Napoli SofaScore row.
            assert player['stats']['npxg'] is not None
        if player['name'] == 'Éderson Silva' and player['season'] == '2425':
            assert player['stats']['npxg'] is None  # Ambiguous names do not inherit a different player's stats.


def test_percentiles_handle_ties():
    assert percentile(1, [1, 1, 1]) == 50
    assert percentile(3, [1, 2, 3]) == 100
    assert percentile(1, [1, 2, 3]) == 0
    assert percentile(100, [1, 2, 3]) == 100
    assert percentile(0, [1, 2, 3]) == 0
    json.dumps(snapshot(), allow_nan=False)


def test_team_comparison_matches_real_incumbents_and_benchmarks():
    result = client.post('/api/recommendations', json=brief(role='creator', position='CM')).json()
    analysis = result['team_analysis']
    assert analysis['position'] == 'CM'
    squad = [p for p in snapshot()['players'] if p['team_id'] == result['team']['id'] and p['season'] == '2526' and 'CM' in p['positions'] and p['minutes'] >= 450]
    assert analysis['incumbents']
    assert {p['id'] for p in analysis['incumbents']} == {p['id'] for p in squad}
    for metric in analysis['metrics']:
        available = [p for p in squad if p['stats'][metric['key']] is not None]
        expected = sum(p['stats'][metric['key']] * p['minutes'] for p in available) / sum(p['minutes'] for p in available)
        assert abs(metric['value'] - expected) < .0001
        assert metric['sample_players'] == len(available)
        assert 0 <= metric['percentile'] <= 100
        assert metric['benchmark_count'] >= 2


def test_goalkeeper_scores_do_not_use_outfield_possession_context():
    result = client.post('/api/recommendations', json=brief(role='shot_stopper', position='GK')).json()
    assert len(result['players']) == 5
    for player in result['players']:
        assert player['compatibility'] is None
        assert player['score'] == player['role_score']
        stats = player['stats']
        assert abs(stats['save_pct'] - 100 * stats['saves'] / (stats['saves'] + stats['conceded'])) < .02


def test_scorecards_and_chart_contributions_are_consistent():
    for key, role in ROLES.items():
        assert abs(sum(role['weights'].values()) - 1) < .00001
        result = client.post('/api/recommendations', json=brief(role=key, position=role['position'])).json()
        for player in result['players']:
            raw_role = sum(m['percentile'] * m['weight'] for m in player['metrics'])
            expected = raw_role if player['compatibility'] is None else .9 * raw_role + .1 * player['compatibility']
            assert abs(player['score'] - expected) < .06


def test_older_season_has_coverage_for_each_position():
    for position in POSITIONS:
        role = next(key for key, r in ROLES.items() if position in r['positions'])
        result = client.post('/api/recommendations', json=brief(season='2425', role=role, position=position)).json()
        assert len(result['players']) == 5, position


def test_missing_club_comparison_stays_unavailable():
    data = snapshot()
    team = next(t for t in data['teams'] if t['season'] == '2526' and not any(p['team_id'] == t['id'] and p['season'] == '2526' and 'SS' in p['positions'] and p['minutes'] >= 450 for p in data['players']))
    result = client.post('/api/recommendations', json=brief(team_id=team['id'], role='link_forward', position='SS')).json()
    assert result['team_analysis']['metrics'] == []
    assert result['team_analysis']['role_score'] is None
    assert len(result['players']) == 5


def test_pagination_preserves_complete_global_ranking():
    first = client.post('/api/recommendations', json=brief(page_size=25)).json()
    second = client.post('/api/recommendations', json=brief(page_size=25, page=2)).json()
    combined = client.post('/api/recommendations', json=brief(page_size=50)).json()
    assert first['eligible'] == second['eligible'] == combined['eligible']
    assert first['pagination']['pages'] == (first['eligible'] + 24) // 25
    assert [p['id'] for p in first['players'] + second['players']] == [p['id'] for p in combined['players']]
    assert len({p['id'] for p in combined['players']}) == len(combined['players'])
    all_ids = []
    for page in range(1, first['pagination']['pages'] + 1):
        result = client.post('/api/recommendations', json=brief(page_size=25, page=page)).json()
        all_ids.extend(p['id'] for p in result['players'])
    assert len(all_ids) == len(set(all_ids)) == first['eligible']
    for patch in [{'page': 0}, {'page_size': 51}, {'page_size': 0}]:
        assert client.post('/api/recommendations', json=brief(**patch)).status_code == 422


def test_individual_incumbent_scores_use_observed_metrics():
    for patch in [{}, {'role': 'creator', 'position': 'CM'}, {'role': 'shot_stopper', 'position': 'GK'}]:
        result = client.post('/api/recommendations', json=brief(**patch)).json()
        weights = ROLES[result['query']['role']]['weights']
        for player in result['team_analysis']['incumbents']:
            raw = next(p for p in snapshot()['players'] if p['id'] == player['id'] and p['team_id'] == result['team']['id'] and p['season'] == result['query']['season'])
            for metric in player['metrics']:
                assert metric['value'] == raw['stats'][metric['key']]
                assert metric['weight'] == weights[metric['key']]
            if len(player['metrics']) == len(weights):
                expected = sum(m['percentile'] * m['weight'] for m in player['metrics'])
                assert abs(player['role_score'] - expected) <= .051
            else:
                assert player['role_score'] is None


def test_comparison_lookup_and_name_search_preserve_brief():
    base = client.post('/api/recommendations', json=brief(page_size=50)).json()
    candidate = base['players'][0]
    lookup = client.post('/api/recommendations', json=brief(player_id=candidate['id'])).json()
    assert lookup['eligible'] == 1
    assert lookup['players'][0]['score'] == candidate['score']
    assert lookup['players'][0]['metrics'] == candidate['metrics']
    name = client.post('/api/recommendations', json=brief(name='LAUTARO MARTINEZ')).json()
    assert name['players'][0]['name'] == 'Lautaro Martínez'
    assert client.post('/api/recommendations', json=brief(name='not a real player')).json()['players'] == []
    assert client.post('/api/recommendations', json=brief(player_id=candidate['id'], max_value=0)).json()['players'] == []
    for patch in [{'name': 'x' * 101}, {'player_id': '../private'}]:
        assert client.post('/api/recommendations', json=brief(**patch)).status_code == 422


def test_named_comparison_includes_current_squad_without_changing_shortlist():
    for name in ['Viktor', 'viktor gyokeres', 'VIKTOR GYÖKERES']:
        recruitment = client.post('/api/recommendations', json=brief(name=name)).json()
        assert recruitment['players'] == []
        comparison = client.post('/api/recommendations', json=brief(name=name, purpose='comparison')).json()
        assert comparison['players'][0]['id'] == '325443'
        assert comparison['players'][0]['team_id'] == 'ENG-Premier League:arsenal'
    restored = client.post('/api/recommendations', json=brief(player_id='325443', purpose='comparison')).json()
    assert restored['players'][0]['name'] == 'Viktor Gyökeres'
    for patch in [{'max_value': 0}, {'foot': 'left'}, {'position': 'GK', 'role': 'shot_stopper'}]:
        response = client.post('/api/recommendations', json=brief(name='Viktor', purpose='comparison', **patch))
        assert response.status_code == 200
        assert response.json()['players'] == []
    assert client.post('/api/recommendations', json=brief(purpose='invalid')).status_code == 422
