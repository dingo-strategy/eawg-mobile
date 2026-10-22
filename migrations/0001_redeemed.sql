-- Migratie 0001: tabel voor ingewisselde muntcodes (POST /api/redeem).
-- Uitvoeren VOOR de nieuwe Worker live gaat (anders faalt ook "account verwijderen"):
--   npx wrangler d1 migrations apply eawg-accounts --remote
-- Lokaal testen: npx wrangler d1 migrations apply eawg-accounts --local
CREATE TABLE IF NOT EXISTS redeemed (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code    TEXT    NOT NULL,
  amount  INTEGER NOT NULL,
  ts      INTEGER NOT NULL,
  PRIMARY KEY (user_id, code)
);
