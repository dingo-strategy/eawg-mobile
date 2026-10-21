"""Zet de RBFA-kernen (naam, wedstrijden, doelpunten) van amateurclubs in public/players.json.

RBFA geeft geen rugnummers of posities. De spelers met de meeste wedstrijden worden de basis (st=1),
de rest staat op volgorde van wedstrijden op de bank. Posities blijven onbekend.
Gebruik: python tools/merge_rbfa.py <onderzoek_amateur_wvl_rbfa_wedstrijden.json>
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PJ = os.path.join(ROOT, 'public', 'players.json')
PART = {'van', 'de', 'der', 'den', 'ten', 'ter', 'el', 'al', 'di', 'da', 'dos', 'le', 'la', 'du', 'het', "'t"}


def cap(w):
    if w.startswith("D'") or w.startswith("N'"):
        return w[:2] + w[2:].capitalize()
    return '-'.join(p.capitalize() for p in w.split('-'))


def voornaam_eerst(raw):
    """RBFA schrijft 'ACHTERNAAM VOORNAAM'; de game wil 'Voornaam Achternaam'."""
    t = raw.split()
    if len(t) < 2:
        return ' '.join(cap(x) for x in t)
    k = 1
    if t[0].lower() in PART:
        while k < len(t) - 1 and t[k].lower() in PART:
            k += 1
        k += 1
    k = min(k, len(t) - 1)
    sur = [x.lower() if x.lower() in PART and i else cap(x) for i, x in enumerate(t[:k])]
    return ' '.join(cap(x) for x in t[k:]) + ' ' + ' '.join(sur)


def main(path):
    cur = json.load(open(PJ, encoding='utf-8'))
    data = json.load(open(path, encoding='utf-8'))
    for club, d in data.items():
        sp = [s for s in d['spelers'] if s.get('wedstrijden', 0) > 0]
        sp.sort(key=lambda s: (-s['wedstrijden'], -s.get('doelpunten', 0), s['name']))
        sp = sp[:22]
        if len(sp) < 8:
            print(club, ': te weinig spelers met wedstrijden, overgeslagen')
            continue
        squad = []
        for i, s in enumerate(sp):
            e = {'name': voornaam_eerst(s['name'])}
            if i < 8:
                e['st'] = 1
            squad.append(e)
        cur[club] = squad
        print('%s: %d spelers, basis %s' % (club, len(squad), ', '.join(x['name'] for x in squad[:3]) + ' ...'))
    json.dump(cur, open(PJ, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('clubs in players.json:', len(cur))


if __name__ == '__main__':
    main(sys.argv[1])
