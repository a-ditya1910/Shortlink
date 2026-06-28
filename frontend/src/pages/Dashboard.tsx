import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Navbar from "../components/Navbar"
import LinkCard from "../components/LinkCard"
import CreateModal from "../components/CreateModal"
import { getLinks } from "../api/links"

interface Link {
  id: number
  shortCode: string
  originalUrl: string
  shortUrl: string
  totalClicks: number
  createdAt: string
  expiresAt: string | null
}

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchLinks = async () => {
    try {
      const res = await getLinks()
      setLinks(res.data.links)
    } catch (err: any) {
      if (err.response?.status !== 401) {
        toast.error("couldn't load links")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks()
    // poll every 15s so click counts update without manual refresh
    const timer = setInterval(fetchLinks, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleDeleted = (id: number) => {
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  const handleUpdated = (id: number, expiresAt: string | null) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, expiresAt } : l)))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">My Links</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {links.length} {links.length === 1 ? "link" : "links"}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + New link
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-slate-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-sm">No links yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-indigo-600 text-sm hover:underline"
            >
              Create your first one
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} onDeleted={handleDeleted} onUpdated={handleUpdated} />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreated={fetchLinks}
        />
      )}
    </div>
  )
}
