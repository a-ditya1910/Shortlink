CREATE TABLE IF NOT EXISTS links (
  id           INT         NOT NULL AUTO_INCREMENT,
  user_id      INT         NOT NULL,
  short_code   VARCHAR(20) NULL,
  original_url TEXT        NOT NULL,
  custom_alias VARCHAR(50) NULL,
  expires_at   TIMESTAMP   NULL,
  created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_short_code   (short_code),
  UNIQUE KEY uq_custom_alias (custom_alias),
  KEY idx_user_id (user_id),
  CONSTRAINT fk_links_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
