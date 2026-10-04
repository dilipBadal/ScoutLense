"""Deterministic source readers and explicit identity aliases; no fuzzy joins."""
import csv
import gzip
import math
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/top5-football-dataset/data'
TM = ROOT / 'data/transfermarkt-datasets'
LEAGUES = {'ENG-Premier League': ('Premier League', 'GB1'), 'ESP-La Liga': ('La Liga', 'ES1'),
           'ITA-Serie A': ('Serie A', 'IT1'), 'GER-Bundesliga': ('Bundesliga', 'L1'), 'FRA-Ligue 1': ('Ligue 1', 'FR1')}


def norm(value):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode().lower())


ALIASES = {
 'manchesterutd': 'manchesterunited', 'nottingham': 'nottinghamforest', 'wolves': 'wolverhamptonwanderers',
 'psg': 'parissaintgermain', 'parissg': 'parissaintgermain', 'asmonaco': 'monaco',
 'inter': 'intermilan', 'internazionale': 'intermilan', 'fcinternazionalemilano': 'intermilan',
 'acmilan': 'milan', 'sscnapoli': 'napoli', 'societasportivanapoli': 'napoli',
 'bayernmunich': 'bayernmunchen', 'fcbayernmunchen': 'bayernmunchen', 'leverkusen': 'bayer04leverkusen',
 'dortmund': 'borussiadortmund', 'gladbach': 'borussiamonchengladbach', 'mainz05': '1fsvmainz05',
 'koln': '1fckoln', 'stpauli': 'fcstpauli', 'heidenheim': '1fcheidenheim1846',
 'stuttgart': 'vfbstuttgart', 'wolfsburg': 'vflwolfsburg', 'bochum': 'vflbochum',
 'freiburg': 'scfreiburg', 'augsburg': 'fcaugsburg', 'hoffenheim': 'tsg1899hoffenheim',
 'unionberlin': '1fcunionberlin', 'hamburg': 'hamburgersv',
 'atletico': 'atleticomadrid', 'atleticomadrid': 'clubatleticodemadrid', 'athleticclub': 'athleticbilbao',
 'athleticclubdebilbao': 'athleticbilbao', 'realbetisbalompie': 'realbetis', 'celta': 'celtavigo',
 'rcceltadevigo': 'celtavigo', 'alaves': 'deportivoalaves', 'osasuna': 'caosasuna',
 'oviedo': 'realoviedo', 'levante': 'levanteud', 'elche': 'elchecf', 'espanyol': 'rcdespanyolbarcelona',
 'valladolid': 'realvalladolid', 'laspalmas': 'udlaspalmas', 'leganes': 'cdleganes',
 'brighton': 'brightonhovealbion', 'spurs': 'tottenhamhotspur', 'tottenham': 'tottenhamhotspur',
 'westham': 'westhamunited', 'leeds': 'leedsunited', 'newcastle': 'newcastleunited',
 'lazio': 'societasportivalaziospa', 'roma': 'asroma', 'hellasverona': 'verona',
 'parma': 'parmacalcio1913', 'como': 'como1907', 'empoli': 'fcempoli',
 'marseille': 'olympiquemarseille', 'lyon': 'olympiquelyon', 'nice': 'ogcnice',
 'rennes': 'staderennaisfc', 'brest': 'stadebrestois29', 'lille': 'losclille',
}


# Verified provider-name variants from the downloaded club records.
ALIASES.update({
 'arsenalfc':'arsenal', 'burnleyfc':'burnley', 'brentfordfc':'brentford', 'sunderlandafc':'sunderland',
 'evertonfc':'everton', 'liverpoolfc':'liverpool', 'chelseafc':'chelsea', 'fulhamfc':'fulham', 'afcbournemouth':'bournemouth',
 'valenciacf':'valencia', 'villarrealcf':'villarreal', 'gironafc':'girona', 'atleticodemadrid':'clubatleticodemadrid',
 'fcbarcelona':'barcelona', 'rcdmallorca':'mallorca', 'sevillafc':'sevilla', 'getafecf':'getafe', 'celtadevigo':'celtavigo',
 'parisfc':'paris', 'fclorient':'lorient', 'angerssco':'angers', 'ajauxerre':'auxerre', 'fcmetz':'metz',
 'fctoulouse':'toulouse', 'rcstrasbourgalsace':'strasbourg', 'lehavreac':'lehavre', 'rclens':'lens', 'fcnantes':'nantes',
 'uslecce':'lecce', 'bolognafootballclub1909':'bologna', 'associazionesportivaroma':'asroma',
 'cagliaricalcio':'cagliari', 'uscremonese':'cremonese', 'genoacfc':'genoa', 'udinesecalcio':'udinese',
 'torinofc':'torino', 'pisasportingclub':'pisa', 'acffiorentina':'fiorentina', 'juventusfc':'juventus',
 'ussassuolo':'sassuolo', 'atalantabc':'atalanta', '1fuballclubheidenheim1846':'1fcheidenheim1846',
 'frankfurt':'eintrachtfrankfurt', 'svwerderbremen':'werderbremen',
 'sheffieldunitedfc':'sheffieldunited', 'lutontown':'lutontown', 'cadizcf':'cadiz', 'granadacf':'granada',
 'ud almeria':'almeria', 'udalmeria':'almeria', 'frosinonecalcio':'frosinone', 'ussalernitana1919':'salernitana',
 'svdarmstadt98':'darmstadt98', 'fckaiserslautern':'kaiserslautern', 'vflosnabruck':'osnabruck',
 'clermontfoot63':'clermontfoot', 'fclorient':'lorient', 'fcstadebrestois':'stadebrestois29'
})


def club_key(value):
    key = norm(value)
    for _ in range(3):
        key = ALIASES.get(key, key)
    return key


def read(path):
    opener = gzip.open if str(path).endswith('.gz') else open
    with opener(path, 'rt', encoding='utf-8-sig', newline='') as handle:
        yield from csv.DictReader(handle)


def number(value):
    try:
        result = float(value)
        return result if math.isfinite(result) else None
    except (ValueError, TypeError):
        return None


def unique_index(rows, key):
    index = {}
    for row in rows:
        index.setdefault(key(row), []).append(row)
    return index


def unique_match(index, keys):
    matches = {id(r): r for key in keys for r in index.get(key, [])}
    return next(iter(matches.values())) if len(matches) == 1 else None
