import mysql from "mysql2/promise"
import env from "../config/env"

const pool = mysql.createPool({
  uri: env.databaseUrl,
  waitForConnections: true,
  connectionLimit: 10,
  ...(env.databaseSsl && { ssl: { rejectUnauthorized: true } }),
})

export default pool
