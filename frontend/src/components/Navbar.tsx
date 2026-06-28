import { useNavigate, Link } from "react-router-dom"
import { logout, getUser } from "../api/auth"

export default function Navbar() {
  const navigate = useNavigate()
  const user = getUser()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="bg-slate-900 px-6 py-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="text-white font-semibold text-lg tracking-tight hover:opacity-80 transition-opacity">
          short<span className="text-indigo-400">link</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm hidden sm:block">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            logout
          </button>
        </div>
      </div>
    </nav>
  )
}
