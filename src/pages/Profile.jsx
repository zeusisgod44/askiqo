import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { PROFILE_EFFECTS } from '@/constants'
import { ProfileEffect } from '@/components/ProfileEffects'
import { Loader2, Send, Mail, ArrowLeft, Crown } from 'lucide-react'

export default function Profile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDMModal, setShowDMModal] = useState(false)
  const [dmText, setDmText] = useState('')
  const [dmLoading, setDmLoading] = useState(false)
  const [isVip, setIsVip] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single()

        if (!profileData) {
          navigate('/')
          return
        }

        setProfile(profileData)

        // VIP kontrol et
        if (profileData.vip_until) {
          const vipExpiry = new Date(profileData.vip_until)
          setIsVip(vipExpiry > new Date())
        }

        const { data: messagesData } = await supabase
          .from('public_messages')
          .select('*')
          .eq('asked_by_user_id', profileData.id)
          .eq('reply', null, { is: false })
          .order('created_at', { ascending: false })

        setMessages(messagesData || [])
      } catch (err) {
        console.error('Load error:', err)
        navigate('/')
      }
      setLoading(false)
    }

    load()
  }, [username, navigate])

  const handleSendDM = async () => {
    if (!dmText.trim() || !profile) return

    setDmLoading(true)

    try {
      await supabase.from('direct_messages').insert({
        to_user_id: profile.id,
        from_user_id: user?.id || null,
        content: dmText.trim(),
        is_anonymous: !user || !isVip,
        is_read: false
      })

      // Notification güncelle
      await supabase
        .from('profiles')
        .update({ has_unread_dms: true })
        .eq('id', profile.id)

      setDmText('')
      setShowDMModal(false)
      alert('Mesaj gönderildi! ✅')
    } catch (err) {
      console.error('DM error:', err)
      alert('Mesaj gönderilemedi')
    }

    setDmLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="font-heading font-bold">Profil bulunamadı</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Link to="/feed" className="brutal-btn px-3 py-2 mb-6 inline-flex gap-2">
        <ArrowLeft size={18} /> Geri
      </Link>

      {/* Profil Header */}
      <div className="brutal-card bg-white dark:bg-dark-card p-8 space-y-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="avatar xl bg-butter dark:bg-dark-card2 relative">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                profile.username?.[0]?.toUpperCase()
              )}
              <ProfileEffect effectId={profile.active_effect} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-3xl">@{profile.username}</h1>
                {isVip && <Crown size={24} className="text-yellow-500" title="VIP Üye" />}
              </div>
              <p className="font-body text-ink/60 dark:text-dark-muted mt-2">
                {profile.bio || 'Bio yok'}
              </p>
              <p className="text-sm text-signal font-heading font-bold mt-2">
                💰 {profile.coins} Coin
              </p>
            </div>
          </div>

          {user?.id !== profile.id && (
            <button
              onClick={() => setShowDMModal(true)}
              className="brutal-btn btn-signal px-4 py-2 gap-2 flex-shrink-0"
            >
              <Mail size={18} /> Mesaj
            </button>
          )}
        </div>
      </div>

      {/* Soruları */}
      <div className="space-y-4">
        <h2 className="font-heading font-bold text-2xl">Sorular ({messages.length})</h2>

        {messages.length === 0 ? (
          <div className="brutal-card bg-butter dark:bg-dark-card2 p-8 text-center">
            <p className="font-heading font-bold">Henüz soru yok</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="brutal-card bg-white dark:bg-dark-card p-6">
              <p className="font-body text-lg mb-3">{msg.content}</p>
              {msg.reply && (
                <div className="p-3 bg-signal/5 border-l-4 border-signal rounded">
                  <p className="text-xs font-heading font-bold text-signal mb-1">✓ Cevap</p>
                  <p className="font-body text-sm">{msg.reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* DM Modal */}
      {showDMModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="brutal-card bg-white dark:bg-dark-card p-8 max-w-md w-full space-y-4">
            <h2 className="font-heading font-bold text-2xl">
              @{profile.username}'a Mesaj Gönder
            </h2>

            <div className="bg-lavender dark:bg-dark-card2 p-3 rounded text-sm">
              {user && isVip ? (
                <p className="text-signal font-heading font-bold">✓ VIP - İsmim gözükecek</p>
              ) : (
                <p className="text-ink/60 dark:text-dark-muted">🔒 Anonim mesaj göndereceksin</p>
              )}
            </div>

            <textarea
              className="brutal-input resize-none h-32"
              placeholder="Mesajını yaz..."
              value={dmText}
              onChange={(e) => setDmText(e.target.value)}
              maxLength={500}
            />

            <p className="text-xs text-ink/40">{dmText.length}/500</p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowDMModal(false)}
                className="brutal-btn flex-1"
              >
                İptal
              </button>
              <button
                onClick={handleSendDM}
                disabled={dmLoading || !dmText.trim()}
                className="brutal-btn btn-signal flex-1 gap-2 disabled:opacity-50"
              >
                {dmLoading ? (
                  <Loader2 size={18} className="animate-spin inline" />
                ) : (
                  <>
                    <Send size={18} /> Gönder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
