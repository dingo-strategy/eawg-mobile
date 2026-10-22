-- Migratie 0002: leerapp koppeling (POST /api/leer/uitgeven)
CREATE TABLE IF NOT EXISTS leerissued (
  leer_id TEXT    NOT NULL,
  streak  INTEGER NOT NULL,
  code    TEXT    NOT NULL,
  ts      INTEGER NOT NULL,
  PRIMARY KEY (leer_id, streak)
);
