import { useNavigate } from "react-router-dom"

export default function Expired() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6">⏰</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Link has expired</h1>
        <p className="text-slate-500 text-sm mb-8">
          This short link is no longer active. It may have been set to expire by its creator.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Go to ShortLink
        </button>
      </div>
    </div>
  )
}
