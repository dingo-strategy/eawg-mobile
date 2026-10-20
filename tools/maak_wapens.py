# Originele EAWG-wapens: schild per club in exact de clubkleuren uit roster.json.
# Geen echte logo's (merkenrisico): eigen ontwerp, patroon afgeleid van de clubnaam.
# Gebruik: python tools/maak_wapens.py   (schrijft public/logos/*.png)
import hashlib
import json
import math
import pathlib

from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "logos"
OUT.mkdir(parents=True, exist_ok=True)

S = 768  # werk op 4x, verklein naar 192 voor gladde randen


def hx(c):
    c = c.lstrip("#")
    return tuple(int(c[i : i + 2], 16) for i in (0, 2, 4))


def lum(rgb):
    r, g, b = rgb
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def mix(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def build(name, code, shirt, shorts, trim):
    shirt, shorts, trim = hx(shirt), hx(shorts), hx(trim)
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    k = 14 * (S // 192)  # randmarge
    w = S - 2 * k
    top, bot = k, S - k

    # schildvorm (supersampled schaal)
    def shield_pts(inset=0):
        i = inset
        return [
            (k + i, top + i),
            (S - k - i, top + i),
            (S - k - i, top + (w) * 0.42),
            (S - k - i, top + (w) * 0.46),
            (S * 0.5, bot - i),
            (k + i, top + (w) * 0.46),
            (k + i, top + (w) * 0.42),
        ]

    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).polygon(shield_pts(0), fill=255)

    # patroon: bepaald door de naam (stabiel per club)
    n = int(hashlib.sha256(name.encode()).hexdigest(), 16)
    pat = n % 6
    base = Image.new("RGBA", (S, S), shirt + (255,))
    pd = ImageDraw.Draw(base)
    if pat == 1:  # horizontale strepen
        for i, y in enumerate(range(top, S - k, w // 8)):
            pd.rectangle([k, y, S - k, y + w // 16], fill=(trim if i % 2 == 0 else shirt) + (255,))
    elif pat == 2:  # verticale strepen
        for i, x in enumerate(range(k, S - k, w // 7)):
            pd.rectangle([x, top, x + w // 14, S - k], fill=(trim if i % 2 == 0 else shirt) + (255,))
    elif pat == 3:  # helften
        pd.rectangle([S // 2, top, S - k, S - k], fill=trim + (255,))
    elif pat == 4:  # schuine driehoek
        pd.polygon([(k, top), (S - k, top), (k, S - k)], fill=trim + (255,))
    elif pat == 5:  # band (sash)
        bw = w // 6
        pd.polygon(
            [(k, top + w // 3), (k, top + w // 3 + bw), (S - k, S - k - w // 4), (S - k, S - k - w // 4 - bw)],
            fill=trim + (255,),
        )

    img.paste(base, (0, 0), mask)

    # binnenzijde in shorts-kleur (dun) + buitenrand donker
    d = ImageDraw.Draw(img)
    d.line(shield_pts(0), fill=mix(hx("#0a0a0a"), shirt, 0.25) + (255,), width=S // 96, joint="curve")
    d.line(shield_pts(S // 96), fill=trim + (255,), width=S // 160, joint="curve")

    # clubcode in contrasterende kleur, licht gebogen gevoel via grote bold font
    fg = (255, 255, 255, 255) if lum(shirt) < 140 or lum(trim) < 100 else (23, 25, 31, 255)
    if pat == 3 and lum(trim) < 140:
        fg = (255, 255, 255, 255)
    font = None
    for p in ["arialbd.ttf", "Arial Bold.ttf", "seguisb.ttf", "segoeuib.ttf"]:
        try:
            font = ImageFont.truetype(p, S // 5)
            break
        except OSError:
            continue
    if font is None:
        font = ImageFont.load_default()
    txt = code[:3]
    bb = d.textbbox((0, 0), txt, font=font)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    cx, cy = S / 2, top + w * 0.34
    # tekstschaduw voor leesbaarheid op elk patroon
    sh = mix(hx("#000000"), shirt, 0.1) + (200,)
    d.text((cx - tw / 2 + S // 300 + 2, cy - th / 2 - bb[1] + 2), txt, font=font, fill=sh)
    d.text((cx - tw / 2, cy - th / 2 - bb[1]), txt, font=font, fill=fg)

    # klein balletje onder de code
    r = S // 44
    bx, by = S / 2, top + w * 0.62
    ball = (255, 255, 255, 235) if lum(shirt) + lum(trim) < 400 else (23, 25, 31, 220)
    d.ellipse([bx - r * 1.6, by - r * 1.6, bx + r * 1.6, by + r * 1.6], fill=ball)
    d.arc([bx - r * 1.6, by - r * 1.6, bx + r * 1.6, by + r * 1.6], 0, 360, fill=mix(ball, (0, 0, 0), 0.4), width=max(2, S // 400))

    return img.resize((192, 192), Image.LANCZOS)


def main():
    roster = json.loads((ROOT / "public" / "roster.json").read_text(encoding="utf-8"))
    seen = set()
    count = 0
    for comp in roster["competitions"]:
        for t in comp["teams"]:
            slug = "".join(ch if ch.isalnum() else "-" for ch in t["name"].lower()).strip("-")
            if slug in seen:
                continue
            seen.add(slug)
            img = build(t["name"], t.get("code", "FC"), t["shirt"], t.get("shorts", "#ffffff"), t.get("trim", "#ffffff"))
            img.save(OUT / f"{slug}.png")
            t["logo"] = f"logos/{slug}.png"
            count += 1
    roster["version"] = max(7, roster.get("version", 6))
    (ROOT / "public" / "roster.json").write_text(json.dumps(roster, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"{count} wapens in {OUT}")


if __name__ == "__main__":
    main()
