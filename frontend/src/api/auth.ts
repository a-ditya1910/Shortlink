import api from "./client"

export const register = (email: string, password: string) =>
  api.post("/api/auth/register", { email, password })

export const login = async (email: string, password: string) => {
  const res = await api.post("/api/auth/login", { email, password })
  localStorage.setItem("token", res.data.token)
  localStorage.setItem("user", JSON.stringify(res.data.user))
  return res.data
}

export const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export const getUser = () => {
  const u = localStorage.getItem("user")
  return u ? JSON.parse(u) : null
}
