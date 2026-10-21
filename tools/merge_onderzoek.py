"""Verwerkt de onderzoeksresultaten (onderzoek_*.json) in public/players.json.

Per club:
- spelers die vertrokken zijn worden verwijderd,
- ontbrekende spelers worden toegevoegd,
- de basisacht krijgt st=1 (de game zet die eerst in de opstelling),
- uiterlijk (sk, hr, hs, bt) van bestaande spelers blijft behouden.
Amateurclubs zonder basis (label ONZEKER en lege lijst) krijgen geen echte namen.

Gebruik: python tools/merge_onderzoek.py <map met onderzoek_*.json>
"""
import glob
import json
import os
import sys
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PJ = os.path.join(ROOT, 'public', 'players.json')
OLD = os.path.join(ROOT, '8v8-bron', 'players.json')


def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return ''.join(c for c in s if c.isalnum())


def key(p):
    # achternaam: laatste woord, zodat "M. Volckaert" en "Volckaert" overeenkomen
    t = str(p.get('name', '')).split()
    return norm(t[-1] if t else '')


def main(folder):
    cur = json.load(open(PJ, encoding='utf-8'))
    old = json.load(open(OLD, encoding='utf-8'))
    log = []
    for f in sorted(glob.glob(os.path.join(folder, 'onderzoek_*.json'))):
        data = json.load(open(f, encoding='utf-8'))
        for club, d in data.items():
            base = d.get('basis') or []
            squad = [dict(p) for p in (cur.get(club) or old.get(club) or [])]
            gone = {norm(x) for x in d.get('vertrokken', [])}
            squad = [p for p in squad if key(p) not in gone and norm(p.get('name')) not in gone]
            have = {key(p) for p in squad}
            for m in d.get('ontbreekt', []):
                if key(m) not in have:
                    squad.append({'n': m.get('n'), 'name': m['name'], 'pos': m.get('pos')})
                    have.add(key(m))
            if not base:
                if d.get('label') == 'ONZEKER' and club not in cur:
                    log.append(club + ': geen basis gevonden, verzonnen namen blijven')
                    continue
            for p in squad:
                p.pop('st', None)
            for b in base:
                hit = next((p for p in squad if key(p) == key(b) and not p.get('st')), None)
                if hit is None:
                    hit = {'n': b.get('n'), 'name': b['name'], 'pos': b.get('pos')}
                    squad.append(hit)
                hit['st'] = 1
                if hit.get('n') in (None, 0) and b.get('n'):
                    hit['n'] = b['n']
                if b.get('pos'):
                    hit['pos'] = b['pos']
            cur[club] = squad
            log.append('%s: %d spelers, basis %d, label %s' % (club, len(squad), len(base), d.get('label')))
    json.dump(cur, open(PJ, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('\n'.join(log))
    print('clubs in players.json:', len(cur))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')
