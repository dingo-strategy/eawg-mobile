# Voegt onderzochte tenuekleuren (JSON-lijsten) samen in public/roster.json,
# maakt daarna de wapens opnieuw en bak de roster in game.js.
# Gebruik: python tools/merge_kits.py kits1.json kits2.json ...
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
rp = ROOT / "public" / "roster.json"
roster = json.loads(rp.read_text(encoding="utf-8"))

index = {}
for comp in roster["competitions"]:
    for t in comp["teams"]:
        index[t["name"].upper()] = t

vervang = 0
mis = []
for pad in sys.argv[1:]:
    data = json.loads(pathlib.Path(pad).read_text(encoding="utf-8"))
    for k in data:
        t = index.get(k["name"].upper())
        if not t:
            mis.append(k["name"])
            continue
        t["shirt"] = k["shirt"]
        t["shorts"] = k.get("shorts", "#ffffff")
        t["sock"] = k.get("sock", k["shirt"])
        t["trim"] = k.get("trim", "#ffffff")
        vervang += 1

rp.write_text(json.dumps(roster, indent=1, ensure_ascii=False), encoding="utf-8")
print(f"{vervang} tenues bijgewerkt; niet gevonden: {mis or 'geen'}")
subprocess.run([sys.executable, str(ROOT / "tools" / "maak_wapens.py")], check=True)
subprocess.run([sys.executable, str(ROOT / "tools" / "werk_roster_in.py")], check=True)
