import api from "./client"

export const getLinks = () => api.get("/api/links")

export const createLink = (data: {
  originalUrl: string
  customAlias?: string
  expiresAt?: string
}) => api.post("/api/links", data)

export const deleteLink = (id: number) => api.delete(`/api/links/${id}`)

export const updateExpiry = (id: number, expiresAt: string | null) =>
  api.patch(`/api/links/${id}/expiry`, { expiresAt })

export const getAnalytics = (id: number) => api.get(`/api/links/${id}/analytics`)
