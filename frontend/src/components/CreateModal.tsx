import { useState } from "react"
import toast from "react-hot-toast"
import { createLink } from "../api/links"

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function CreateModal({ onClose, onCreated }: Props) {
  const [url, setUrl] = useState("")
  const [alias, setAlias] = useState("")
  const [expiry, setExpiry] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    try {
      await createLink({
        originalUrl: url.trim(),
        customAlias: alias.trim() || undefined,
        expiresAt: expiry || undefined,
      })
      toast.success("link created!")
      onCreated()
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.error || "something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">New short link</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 mt-4 space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Destination URL</label>
            <input
              type="url"
              placeholder="https://example.com/some/long/url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1.5">
              Custom alias <span className="text-slate-400">(optional)</span>
            </label>
            <div className="flex items-center border border-slate-200 rounded-lg focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition">
              <span className="pl-3 text-slate-400 text-sm">
                {(import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/https?:\/\//, "")}/
              </span>
              <input
                type="text"
                placeholder="my-link"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="flex-1 px-2 py-2.5 text-sm outline-none rounded-r-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1.5">
              Expiry date <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="datetime-local"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              {loading ? "Creating..." : "Create link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
