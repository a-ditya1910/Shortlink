import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { deleteLink, updateExpiry } from "../api/links"

interface Link {
  id: number
  shortCode: string
  originalUrl: string
  shortUrl: string
  totalClicks: number
  createdAt: string
  expiresAt: string | null
}

interface Props {
  link: Link
  onDeleted: (id: number) => void
  onUpdated: (id: number, expiresAt: string | null) => void
}

export default function LinkCard({ link, onDeleted, onUpdated }: Props) {
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editingExpiry, setEditingExpiry] = useState(false)
  const [newExpiry, setNewExpiry] = useState(
    link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : ""
  )
  const [savingExpiry, setSavingExpiry] = useState(false)
  const navigate = useNavigate()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (!confirm("Delete this link?")) return
    setDeleting(true)
    try {
      await deleteLink(link.id)
      toast.success("link deleted")
      onDeleted(link.id)
    } catch {
      toast.error("couldn't delete link")
      setDeleting(false)
    }
  }

  const handleSaveExpiry = async (overrideVal?: string | null) => {
    setSavingExpiry(true)
    try {
      const val = overrideVal !== undefined ? overrideVal : (newExpiry.trim() || null)
      await updateExpiry(link.id, val)
      toast.success(val ? "expiry updated" : "expiry removed")
      onUpdated(link.id, val)
      setEditingExpiry(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error || "couldn't update expiry")
    } finally {
      setSavingExpiry(false)
    }
  }

  const truncate = (url: string, max = 55) =>
    url.length > max ? url.slice(0, max) + "..." : url

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

  const isExpired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false

  return (
    <div className={`bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow ${isExpired ? "border-red-200 opacity-70" : "border-slate-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-slate-500 text-sm truncate" title={link.originalUrl}>
            {truncate(link.originalUrl)}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 font-medium text-sm hover:text-indigo-800"
            >
              {link.shortUrl.replace(/https?:\/\//, "")}
            </a>
            <button
              onClick={handleCopy}
              className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              {copied ? "copied!" : "copy"}
            </button>
            {isExpired && (
              <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-400">expired</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 pt-0.5">
          <span className="text-xs text-slate-400">{link.totalClicks} clicks</span>
          <button
            onClick={() => navigate(`/analytics/${link.id}`)}
            className="text-slate-400 hover:text-indigo-600 transition-colors text-sm"
          >
            stats
          </button>
          <button
            onClick={() => setEditingExpiry(!editingExpiry)}
            className={`text-sm transition-colors ${editingExpiry ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            expiry
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-slate-400 hover:text-red-500 transition-colors text-sm disabled:opacity-40"
          >
            delete
          </button>
        </div>
      </div>

      {/* inline expiry editor — only shows when user clicks "expiry" */}
      {editingExpiry && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="datetime-local"
            value={newExpiry}
            onChange={(e) => setNewExpiry(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          />
          <button
            onClick={() => handleSaveExpiry()}
            disabled={savingExpiry}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {savingExpiry ? "saving..." : "save"}
          </button>
          <button
            onClick={() => handleSaveExpiry(null)}
            disabled={savingExpiry}
            className="border border-slate-200 text-slate-500 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-50 transition"
            title="Remove expiry — link lives forever"
          >
            remove
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 mt-2.5">
        <span className="text-xs text-slate-400">{formatDate(link.createdAt)}</span>
        {link.expiresAt && !isExpired && (
          <span className="text-xs text-amber-500">expires {formatDate(link.expiresAt)}</span>
        )}
      </div>
    </div>
  )
}
