import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import Navbar from "../components/Navbar"
import { getAnalytics } from "../api/links"

interface AnalyticsData {
  linkId: number
  shortCode: string
  originalUrl: string
  totalClicks: number
  byDay: { day: string; clicks: number }[]
  byDevice: Record<string, number>
  byCountry: Record<string, number>
}

export default function Analytics() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalytics(Number(id))
      .then((res) => setData(res.data))
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-40 bg-slate-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const deviceEntries = Object.entries(data.byDevice)
  const countryEntries = Object.entries(data.byCountry)

  const chartData = data.byDay.map((d) => ({
    ...d,
    day: new Date(d.day).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-flex items-center gap-1"
        >
          ← back
        </button>

        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <p className="text-xs text-slate-400 mb-1">Destination</p>
          <p className="text-sm text-slate-700 truncate">{data.originalUrl}</p>
          <p className="text-indigo-600 text-sm font-medium mt-1">
            {(import.meta.env.VITE_API_URL || "http://localhost:4000")}/{data.shortCode}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 text-center">
          <p className="text-5xl font-bold text-slate-800">{data.totalClicks}</p>
          <p className="text-slate-400 text-sm mt-1">total clicks</p>
        </div>

        {chartData.length > 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
            <p className="text-sm font-medium text-slate-700 mb-4">Clicks — last 30 days</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={24}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  cursor={{ fill: "#f1f5f9" }}
                />
                <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="#6366f1" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 text-center text-slate-400 text-sm py-10">
            No click data in the last 30 days
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-sm font-medium text-slate-700 mb-3">By device</p>
            {deviceEntries.length === 0 ? (
              <p className="text-slate-400 text-xs">No data</p>
            ) : (
              <div className="space-y-2">
                {deviceEntries.map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 capitalize">{device}</span>
                    <span className="text-sm font-medium text-slate-800">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-sm font-medium text-slate-700 mb-3">By country</p>
            {countryEntries.length === 0 ? (
              <p className="text-slate-400 text-xs">No data</p>
            ) : (
              <div className="space-y-2">
                {countryEntries.map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{country}</span>
                    <span className="text-sm font-medium text-slate-800">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
