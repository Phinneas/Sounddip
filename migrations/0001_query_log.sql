CREATE TABLE IF NOT EXISTS query_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  zip TEXT NOT NULL,
  radius INTEGER NOT NULL,
  result_count INTEGER NOT NULL,
  result_type TEXT NOT NULL,        -- 'results' | 'fallback' | 'invalid'
  fallback_city TEXT,               -- set when result_type = 'fallback'
  fallback_slug TEXT
);
CREATE INDEX IF NOT EXISTS idx_query_log_zip ON query_log (zip);
CREATE INDEX IF NOT EXISTS idx_query_log_zero ON query_log (result_count) WHERE result_count = 0;