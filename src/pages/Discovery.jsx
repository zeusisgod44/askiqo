import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Loader2, MessageCircle, Heart, SkipForward } from 'lucide-react'

export default function Discovery() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [liking, setLiking] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id)
        .order('points', { ascending: false })
        .limit(20)
      
      setProfiles(data || [])
      setLoading(false)
    }
    load()
  }, [user?.id])

  const currentProfile = profiles[currentIdx]

  const handleLike = async () => {
    if (!currentProfile) return
    setLiking(true)
    
    // 50 puan ekle (liked olunca)
    await supabase
      .from('profiles')
      .update({ points: (currentProfile.points || 0) + 50 })
      .eq('id', currentProfile.id)
    
    setLiking(false)
    next()
  }

  const next = () => {
    if (currentIdx < profiles.length - 1) {
      setCurrentIdx(currentIdx + 1)
    } else {
      setProfiles([])
      setCurrentIdx(0)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={32} className="animate-spin" />
    </div>
  )

  if (!currentProfile) {
    return (
      <div className="py-20 text-center">
        <p className="font-heading font-bold text-2xl mb-4">Daha kimse kalmadı!</p>
        <button onClick={() => window.location.reload()} className="brutal-btn btn-signal px-6 py-3">
          Tekrar yükle
        </button>
      </div>
    )
  }

  return (
    <div className="py-10 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="brutal-card bg-white dark:bg-dark-card p-8 text-center space-y-6">
          {/* Avatar */}
          <div className="avatar lg bg-butter dark:bg-dark-card2 mx-auto">
            {currentProfile.avatar_url
              ? <img src={currentProfile.avatar_url} alt="" />
              : currentProfile.username?.[0]?.toUpperCase()
            }
          </div>

          {/* Info */}
          <div>
            <h2 className="font-heading font-black text-3xl">@{currentProfile.username}</h2>
            {currentProfile.bio && (
              <p className="font-body text-ink/60 dark:text-dark-muted mt-2">{currentProfile.bio}</p>
            )}
            <p className="text-sm text-ink/40 dark:text-dark-muted mt-1">
              ⭐ {currentProfile.points || 0} puan
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={next}
              className="brutal-btn px-6 py-3 gap-2"
            >
              <SkipForward size={18} /> Geç
            </button>
            <button
              onClick={handleLike}
              disabled={liking}
              className="brutal-btn btn-signal px-6 py-3 gap-2"
            >
              {liking ? <Loader2 size={18} className="animate-spin" /> : <><Heart size={18} /> Merak Et</>}
            </button>
          </div>

          {/* Message CTA */}
          <button
            onClick={() => navigate(`/messages/${currentProfile.username}`)}
            className="brutal-btn w-full py-3 gap-2 text-lg"
          >
            <MessageCircle size={20} /> Mesaj Gönder
          </button>
        </div>

        {/* Progress */}
        <p className="text-center mt-6 text-sm text-ink/40">
          {currentIdx + 1} / {profiles.length}
        </p>
      </div>
    </div>
  )
}
