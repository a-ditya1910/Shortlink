CREATE TABLE IF NOT EXISTS clicks (
  id         INT         NOT NULL AUTO_INCREMENT,
  link_id    INT         NOT NULL,
  ip         VARCHAR(45) NULL,
  device     VARCHAR(20) NULL,
  country    VARCHAR(50) NULL,
  clicked_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_link_id    (link_id),
  KEY idx_clicked_at (clicked_at),
  CONSTRAINT fk_clicks_link FOREIGN KEY (link_id) REFERENCES links (id) ON DELETE CASCADE
);
