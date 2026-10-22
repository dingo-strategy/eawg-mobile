// Maakt een muntcode voor EAWG Mobile (in te wisselen bij DAGREEKS, CODE INWISSELEN).
// Gebruik (Git Bash):  REDEEM_SECRET=jouwgeheim node tools/maak_muntcode.mjs 150
// Optioneel een datum (JJJJMMDD) als tweede waarde, standaard vandaag (UTC).
// Het geheim moet hetzelfde zijn als de geheime waarde REDEEM_SECRET van de Worker.
// Codevorm: <bedrag>.<datum>.<nonce>.<handtekening>, max 500 munten, 30 dagen geldig, een keer per account.
import { createHmac, randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function base32(bytes) {
  let bits = 0, val = 0, out = "";
  for (const b of bytes) {
    val = (val << 8) | b; bits += 8;
    while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31];
  return out;
}
export function maakCode(secret, amount, day, nonce) {
  day = day || new Date().toISOString().slice(0, 10).replace(/-/g, "");
  nonce = nonce || base32(randomBytes(5)).slice(0, 8);
  const msg = `${amount}.${day}.${nonce}`;
  const sig = base32(createHmac("sha256", secret).update(msg).digest().subarray(0, 10));
  return `${msg}.${sig}`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const secret = process.env.REDEEM_SECRET;
  const amount = Number(process.argv[2]);
  const day = process.argv[3];
  if (!secret || secret.length < 16) { console.error("Zet eerst REDEEM_SECRET (minstens 16 tekens) in je omgeving."); process.exit(1); }
  if (!Number.isInteger(amount) || amount < 1 || amount > 500) { console.error("Bedrag moet een geheel getal van 1 tot 500 zijn."); process.exit(1); }
  if (day && !/^\d{8}$/.test(day)) { console.error("Datum moet JJJJMMDD zijn."); process.exit(1); }
  console.log(maakCode(secret, amount, day));
}
