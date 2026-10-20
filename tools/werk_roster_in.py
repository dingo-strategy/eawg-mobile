# Werkt public/roster.json in als ingebakken fallback (const ef) in public/game.js,
# zodat de game ook zonder roster.json (offline) de juiste clubs/kleuren/wapens heeft.
# Gebruik: python tools/werk_roster_in.py
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
roster = json.loads((ROOT / "public" / "roster.json").read_text(encoding="utf-8"))
gp = ROOT / "public" / "game.js"
js = gp.read_text(encoding="utf-8")

a = js.index("const ef = {")
b = js.index("function ff(t)", a)
blok = "const ef = " + json.dumps(roster, ensure_ascii=False, separators=(", ", ": ")) + ";\n  "
gp.write_text(js[:a] + blok + js[b:], encoding="utf-8")
print("ef-blok vervangen, version =", roster.get("version"))
