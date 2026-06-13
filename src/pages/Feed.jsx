import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { CATEGORIES } from '@/constants'
import { Heart, Share2, Loader2, Trash2 } from 'lucide-react'

export default function Feed() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [likedByMe, setLikedByMe] = useState(new Set())
  const [error, setError] = useState('')
  const [likeLoading, setLikeLoading] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const deleteInProgressRef = useRef(false)

  // Mesajları ve benimkileri yükle
  useEffect(() => {
    async function load() {
      if (!user || deleteInProgressRef.current) return

      try {
        // Mesajları çek
        let query = supabase
          .from('public_messages')
          .select(`
            id,
            content,
            category,
            reply,
            replied_at,
            likes,
            created_at,
            to_user_id,
            asked_by_user_id,
            profiles:asked_by_user_id(id, username, avatar_url, active_effect)
          `)

        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory)
        }

        query = query.order('likes', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(100)

        const { data: messagesData, error: msgsErr } = await query

        if (msgsErr) throw msgsErr

        // Benim liked mesajlarımı çek
        const { data: myLikes, error: likesErr } = await supabase
          .from('liked_messages')
          .select('message_id')
          .eq('user_id', user.id)

        if (likesErr) throw likesErr

        const likedSet = new Set(myLikes?.map(l => l.message_id) || [])
        setLikedByMe(likedSet)
        setMessages(messagesData || [])
        setError('')
      } catch (err) {
        console.error('Load error:', err)
        setError(err.message)
      }
      setLoading(false)
    }

    load()
    const interval = setInterval(load, 2000)
    return () => clearInterval(interval)
  }, [selectedCategory, user])

  // Like/Unlike
  const handleLike = async (msgId) => {
    if (likeLoading === msgId) return

    const msg = messages.find(m => m.id === msgId)
    if (!msg) return

    const isLiked = likedByMe.has(msgId)
    setLikeLoading(msgId)

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('liked_messages')
          .delete()
          .eq('user_id', user.id)
          .eq('message_id', msgId)

        const newLikes = Math.max(0, (msg.likes || 1) - 1)
        await supabase
          .from('public_messages')
          .update({ likes: newLikes })
          .eq('id', msgId)

        setMessages(prev =>
          prev.map(m => m.id === msgId ? { ...m, likes: newLikes } : m)
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        )

        setLikedByMe(prev => {
          const newSet = new Set(prev)
          newSet.delete(msgId)
          return newSet
        })
      } else {
        // Like
        await supabase
          .from('liked_messages')
          .insert({ user_id: user.id, message_id: msgId })

        const newLikes = (msg.likes || 0) + 1
        await supabase
          .from('public_messages')
          .update({ likes: newLikes })
          .eq('id', msgId)

        setMessages(prev =>
          prev.map(m => m.id === msgId ? { ...m, likes: newLikes } : m)
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        )

        setLikedByMe(prev => new Set([...prev, msgId]))
      }
    } catch (err) {
      console.error('Like error:', err)
      alert('İşlem başarısız')
    }

    setLikeLoading(null)
  }

  // Sil
  const handleDelete = async (msgId) => {
    if (!confirm('Soruyu silmek istediğine emin misin?')) return

    deleteInProgressRef.current = true
    setDeleteLoading(msgId)
    setMessages(prev => prev.filter(m => m.id !== msgId))

    try {
      const { error } = await supabase
        .from('public_messages')
        .delete()
        .eq('id', msgId)
        .eq('asked_by_user_id', user.id)

      if (error) throw error

      setTimeout(() => {
        setDeleteLoading(null)
        deleteInProgressRef.current = false
      }, 500)
    } catch (err) {
      console.error('Delete error:', err)
      alert('Silme başarısız: ' + err.message)
      deleteInProgressRef.current = false
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="font-heading font-bold">Giriş yap</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Soru Sor Butonu */}
      <Link
        to="/ask"
        className="brutal-btn btn-signal w-full py-3 mb-6 justify-center text-lg font-heading font-bold"
      >
        💭 Soru Sor
      </Link>

      {/* Kategori Filtreleri */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`brutal-btn px-4 py-2 text-sm whitespace-nowrap flex-shrink-0 font-heading font-bold transition-all ${
            selectedCategory === 'all' ? 'bg-signal text-white' : 'hover:scale-105'
          }`}
        >
          Tümü
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`brutal-btn px-4 py-2 text-sm whitespace-nowrap flex-shrink-0 font-heading font-bold transition-all ${
              selectedCategory === cat.id ? 'bg-signal text-white' : 'hover:scale-105'
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Hata */}
      {error && (
        <div className="brutal-card bg-peach dark:bg-dark-card2 p-4 mb-6 text-red-700 font-body text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Sorular */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="brutal-card bg-butter dark:bg-dark-card2 p-8 text-center">
            <p className="font-heading font-bold text-lg">Henüz soru yok</p>
            <p className="text-sm text-ink/50 mt-2">İlk soruyu sen sor!</p>
          </div>
        ) : (
          messages.map(msg => {
            const profileData = Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles
            const isLiked = likedByMe.has(msg.id)
            const likeCount = msg.likes || 0
            const isOwnMessage = user.id === msg.asked_by_user_id || user.id === msg.to_user_id

            return (
              <div
                key={msg.id}
                className="brutal-card bg-white dark:bg-dark-card p-6 space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {profileData && (
                      <Link
                        to={`/u/${profileData?.username}`}
                        className="avatar sm bg-butter dark:bg-dark-card2 flex-shrink-0 hover:scale-110 transition-transform"
                      >
                        {profileData?.avatar_url ? (
                          <img src={profileData.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          profileData?.username?.[0]?.toUpperCase()
                        )}
                      </Link>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {profileData && (
                          <Link
                            to={`/u/${profileData?.username}`}
                            className="font-heading font-bold text-ink dark:text-dark-text hover:text-signal truncate"
                          >
                            @{profileData?.username}
                          </Link>
                        )}
                        <span className="text-xs text-ink/40 dark:text-dark-muted flex-shrink-0">
                          {new Date(msg.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="chip text-xs">
                      {CATEGORIES.find(c => c.id === msg.category)?.emoji}
                    </span>
                    {isOwnMessage && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        disabled={deleteLoading === msg.id}
                        className="brutal-btn px-2 py-2 text-xs hover:bg-peach dark:hover:bg-dark-card2 disabled:opacity-50"
                        title="Soruyu sil"
                      >
                        {deleteLoading === msg.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <p className="font-body text-lg leading-relaxed text-ink dark:text-dark-text">
                  {msg.content}
                </p>

                {/* Cevap */}
                {msg.reply && (
                  <div className="p-4 rounded-xl border-2 border-signal/20 bg-signal/5 dark:bg-dark-card2 space-y-2">
                    <p className="text-xs font-heading font-bold text-signal">✓ Cevap</p>
                    <p className="font-body text-sm text-ink dark:text-dark-text">{msg.reply}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-ink/10 dark:border-dark-border">
                  <button
                    onClick={() => handleLike(msg.id)}
                    disabled={likeLoading === msg.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-heading font-bold text-sm ${
                      isLiked
                        ? 'bg-signal/10 text-signal'
                        : 'text-ink/60 dark:text-dark-muted hover:bg-signal/10 hover:text-signal'
                    } ${likeLoading === msg.id ? 'cursor-wait' : 'cursor-pointer'}`}
                  >
                    {likeLoading === msg.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Heart
                        size={18}
                        fill={isLiked ? 'currentColor' : 'none'}
                        strokeWidth={isLiked ? 0 : 2}
                      />
                    )}
                    {likeCount > 0 && (
                      <>
                        <span>{likeCount}</span>
                        <span className="text-xs text-ink/50 dark:text-dark-muted">
                          {isLiked ? 'beğendin' : 'beğeni'}
                        </span>
                      </>
                    )}
                  </button>
                  <button className="flex items-center gap-1 px-4 py-2 text-ink/60 dark:text-dark-muted hover:text-signal hover:bg-signal/10 rounded-lg transition-all font-heading font-bold text-sm">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
