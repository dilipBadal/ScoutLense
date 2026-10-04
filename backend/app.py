from fastapi import FastAPI, HTTPException, Response
from backend.models import SearchRequest
from backend.ranking import recommend
from backend.roles import ROLES, METRICS, POSITIONS
from backend.store import snapshot

app = FastAPI(title='ScoutLens API', version='0.1.0', docs_url='/api/docs', openapi_url='/api/openapi.json', redoc_url=None)


@app.get('/api/health')
def health():
    data = snapshot()
    return {'status': 'ok', 'player_spells': len(data['players']), 'prepared_at': data['prepared_at']}


@app.get('/api/catalog')
def catalog(response: Response):
    data = snapshot()
    response.headers['Cache-Control'] = 'public, max-age=3600'
    return {'seasons': data['seasons'], 'leagues': data['leagues'], 'teams': data['teams'],
            'positions': [{'id': key, 'name': name} for key, name in POSITIONS.items()],
            'roles': [{'id': key, **value} for key, value in ROLES.items()],
            'metrics': METRICS, 'report': data['report'], 'prepared_at': data['prepared_at'],
            'limitations': ['Historical squads: 2024/25 and 2025/26, not live transfer availability.',
                            'Advanced pressing, progressive carries and passing under pressure are unavailable.',
                            'Market values are dated estimates, not asking prices; wages are not verified.',
                            'Role labels describe statistical proxies; pressing and off-ball movement are not verified.',
                            'Goalkeeper save percentage uses saves / (saves + goals conceded), without shot-quality adjustment.',
                            'Formation is planning context and does not alter the statistical score.']}


@app.post('/api/recommendations')
def recommendations(query: SearchRequest):
    try:
        return recommend(query)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
