import express from "express"
import cors from "cors"
import env from "./config/env"
import authRoutes from "./routes/auth.routes"
import linksRoutes from "./routes/links.routes"
import redirectRoutes from "./routes/redirect.routes"
import { errorHandler } from "./middleware/errorHandler"

const app = express()

app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}))

app.set("trust proxy", 1)
app.use(express.json())

app.get("/", (req, res) => {
  res.json({ ok: true })
})

app.use("/api/auth", authRoutes)
app.use("/api/links", linksRoutes)

// redirect must be after all /api routes — /:shortCode would swallow everything otherwise
app.use(redirectRoutes)

// must be last — catches errors thrown in all routes above
app.use(errorHandler)

export default app
