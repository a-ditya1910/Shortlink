import "dotenv/config" // must be first — loads .env into process.env before anything else runs

import app from "./app"
import env from "./config/env"

app.listen(env.port, () => {
  console.log(`server running on port ${env.port}`)
})
