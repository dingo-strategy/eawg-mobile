-- EAWG Mobile: accounts en spelopslag (Cloudflare D1, SQLite).
-- Veilig om opnieuw uit te voeren: alles gebruikt IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  username    TEXT    NOT NULL,            -- oorspronkelijke schrijfwijze, om te tonen
  username_lc TEXT    NOT NULL UNIQUE,     -- kleine letters, voor uniek zijn
  pw_hash     TEXT    NOT NULL,            -- PBKDF2-SHA256, base64
  pw_salt     TEXT    NOT NULL,            -- 16 willekeurige bytes, base64
  pw_iter     INTEGER NOT NULL,            -- aantal rondes, zodat het later omhoog kan
  rc_hash     TEXT    NOT NULL,            -- SHA-256 van zout plus herstelcode, base64
  rc_salt     TEXT    NOT NULL,            -- eigen zout voor de herstelcode, base64
  created     INTEGER NOT NULL             -- tijdstip in milliseconden
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT    PRIMARY KEY,          -- SHA-256 van het token, base64url; het token zelf wordt nooit opgeslagen
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires    INTEGER NOT NULL,             -- vervaldatum in milliseconden
  created    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);

CREATE TABLE IF NOT EXISTS saves (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data    TEXT    NOT NULL,                -- JSON-tekst, max 200000 tekens
  updated INTEGER NOT NULL                 -- tijdstip in milliseconden
);

-- Pogingen voor de beperking: mislukte login en herstel, en nieuwe accounts per IP.
CREATE TABLE IF NOT EXISTS attempts (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT    NOT NULL,                   -- 'login', 'recover' of 'register'
  ip   TEXT    NOT NULL,
  key  TEXT    NOT NULL,                   -- gebruikersnaam in kleine letters, of '' bij register
  ts   INTEGER NOT NULL                    -- tijdstip in milliseconden
);
CREATE INDEX IF NOT EXISTS idx_attempts_ip_key ON attempts(ip, key, ts);
CREATE INDEX IF NOT EXISTS idx_attempts_ip_kind ON attempts(ip, kind, ts);
CREATE INDEX IF NOT EXISTS idx_attempts_ts ON attempts(ts);

-- Ingewisselde muntcodes (POST /api/redeem). Een code werkt een keer per account.
-- code = "<bedrag>.<datum>.<nonce>" zonder handtekening. Zelfde inhoud staat in migrations/0001_redeemed.sql.
CREATE TABLE IF NOT EXISTS redeemed (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code    TEXT    NOT NULL,
  amount  INTEGER NOT NULL,                -- aantal munten (1 tot 500)
  ts      INTEGER NOT NULL,                -- tijdstip in milliseconden
  PRIMARY KEY (user_id, code)
);

-- leerapp koppeling: een code per (leerling, aantal dagen reeks)
CREATE TABLE IF NOT EXISTS leerissued (
  leer_id TEXT    NOT NULL,
  streak  INTEGER NOT NULL,
  code    TEXT    NOT NULL,
  ts      INTEGER NOT NULL,
  PRIMARY KEY (leer_id, streak)
);
