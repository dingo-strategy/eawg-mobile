# Tijdelijk app-icoon (bal op gestreept gras), zolang het echte EAWG-logo ontbreekt.
# Gebruik: python tools/maak_iconen.py  (schrijft icon-192.png en icon-512.png in de projectmap)
import math, struct, zlib, pathlib

def chunk(tag, data):
    return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

def icon(size):
    c = size / 2
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            d = math.hypot(x - c, y - c)
            col = (35, 133, 65) if (x * 8 // size) % 2 == 0 else (31, 122, 58)
            if d < size * 0.30:
                col = (30, 30, 30) if d > size * 0.27 or d < size * 0.09 else (255, 255, 255)
            raw += bytes(col)
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(bytes(raw), 9)) + chunk(b'IEND', b'')

root = pathlib.Path(__file__).resolve().parent.parent
for s in (192, 512):
    (root / f'icon-{s}.png').write_bytes(icon(s))
    print(f'icon-{s}.png gemaakt')
