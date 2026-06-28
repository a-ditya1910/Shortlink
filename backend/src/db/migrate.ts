import "dotenv/config"
import mysql from "mysql2/promise"
import env from "../config/env"

const migrations = [
  `CREATE TABLE IF NOT EXISTS users (
    id         INT          NOT NULL AUTO_INCREMENT,
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
  )`,
  `CREATE TABLE IF NOT EXISTS links (
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
  )`,
  `CREATE TABLE IF NOT EXISTS clicks (
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
  )`,
]

async function run() {
  const conn = await mysql.createConnection({
    uri: env.databaseUrl,
    ...(env.databaseSsl && { ssl: { rejectUnauthorized: true } }),
  })

  for (const sql of migrations) {
    await conn.query(sql)
  }

  await conn.end()
  console.log("migrations done")
  process.exit(0)
}

run().catch((err) => {
  console.error("migration failed:", err.message)
  process.exit(1)
})
