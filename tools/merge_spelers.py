# Voegt onderzochte spelersselecties (JSON-bestanden) samen tot public/players.json.
# Formaat per speler: {n, name, pos, sk, hr, hs, bt}. Ontbrekende clubs vallen terug op de ingebouwde namen.
# Gebruik: python tools/merge_spelers.py selectie1.json selectie2.json ...
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
pp = ROOT / "public" / "players.json"
data = {}
if pp.exists():
    data = json.loads(pp.read_text(encoding="utf-8"))

n_in = 0
for pad in sys.argv[1:]:
    for club, spelers in json.loads(pathlib.Path(pad).read_text(encoding="utf-8")).items():
        lijst = [dict(x, name=str(x["name"]).strip().replace("  ", " ")) for x in spelers if x.get("name") and isinstance(x.get("n"), int) and "?" not in str(x["name"])][:13]
        if lijst:
            data[club.upper()] = lijst
            n_in += len(lijst)

pp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{n_in} spelers van {len(sys.argv)-1} bestanden; totaal {sum(len(v) for v in data.values())} spelers over {len(data)} clubs")
