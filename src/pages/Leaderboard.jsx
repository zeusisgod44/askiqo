import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'
import { Loader2, Medal, Trophy } from 'lucide-react'

export default function Leaderboard() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(100)
      setProfiles(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const getRank = (points) => {
    if (points >= 5000) return { label: 'Efsane', emoji: '👑' }
    if (points >= 2000) return { label: 'Usta', emoji: '🥇' }
    if (points >= 500) return { label: 'Popüler', emoji: '🥈' }
    if (points >= 100) return { label: 'Yükselen', emoji: '🥉' }
    return { label: 'Yeni', emoji: '⭕' }
  }

  const getMedalIcon = (pos) => {
    if (pos === 0) return '🥇'
    if (pos === 1) return '🥈'
    if (pos === 2) return '🥉'
    return `#${pos + 1}`
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={32} className="animate-spin" />
    </div>
  )

  return (
    <div className="py-10 space-y-6">
      <div className="space-y-1">
        <span className="chip">leaderboard</span>
        <h1 className="font-heading font-black text-4xl mt-2 flex items-center gap-2">
          <Trophy size={40} className="text-signal" /> Sıralama
        </h1>
      </div>

      {/* Top 3 Highlight */}
      <div className="grid md:grid-cols-3 gap-4">
        {profiles.slice(0, 3).map((p, idx) => {
          const rank = getRank(p.points)
          return (
            <Link
              key={p.id}
              to={`/u/${p.username}`}
              className={`brutal-card p-6 text-center hover:scale-105 transition-transform ${
                idx === 0
                  ? 'bg-signal text-white border-signal md:col-span-3 md:scale-105'
                  : idx === 1
                  ? 'bg-butter dark:bg-dark-card2'
                  : 'bg-peach dark:bg-dark-card2'
              }`}
            >
              <p className="text-4xl mb-2">{getMedalIcon(idx)}</p>
              <p className="font-heading font-black text-2xl">@{p.username}</p>
              <p className={`text-sm mt-1 ${idx === 0 ? 'opacity-90' : ''}`}>
                ⭐ {p.points} puan
              </p>
              <p className="text-xs mt-1 opacity-75">{rank.label}</p>
            </Link>
          )
        })}
      </div>

      {/* Full List */}
      <div className="space-y-2">
        <h2 className="font-heading font-bold text-xl">Tüm Oyuncular</h2>
        {profiles.map((p, idx) => {
          const rank = getRank(p.points)
          return (
            <Link
              key={p.id}
              to={`/u/${p.username}`}
              className="brutal-card bg-white dark:bg-dark-card p-4 flex items-center justify-between hover:scale-102 transition-transform"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="font-heading font-black text-lg w-8 text-center">#{idx + 1}</span>
                <div className="w-10 h-10 rounded-full bg-butter dark:bg-dark-card2 flex items-center justify-center flex-shrink-0 font-heading font-bold">
                  {p.avatar_url
                    ? <img src={p.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    : p.username?.[0]?.toUpperCase()
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold truncate">@{p.username}</p>
                  <p className="text-xs text-ink/40 dark:text-dark-muted">{rank.label}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-heading font-bold text-signal">⭐ {p.points}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
