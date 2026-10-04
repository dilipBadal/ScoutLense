import json
from functools import lru_cache
from pathlib import Path


@lru_cache(maxsize=1)
def snapshot():
    path = Path(__file__).parent / 'assets/scoutlens.json'
    if not path.exists():
        raise RuntimeError('Prepared data missing. Run python3 -m scripts.prepare_data before deployment.')
    return json.loads(path.read_text())
