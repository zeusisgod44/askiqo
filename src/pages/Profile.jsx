import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { PROFILE_EFFECTS } from '@/constants'
import { ProfileEffect } from '@/components/ProfileEffects'
import { Loader2, Send, Edit, ArrowLeft, Crown } from 'lucide-react'

// RGB Renk animasyonu
const getAnimatedColor = (baseColor, offset = 0) => {
  const time = (Date.now() / 10 + offset) % 360
  const hsl = `hsl(${time}, 100%, 50%)`
  return hsl
}

export default function Profile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [bioQuestions, setBioQuestions] = useState([])
  const [myQuestions, setMyQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBioModal, setShowBioModal] = useState(false)
  const [bioText, setBioText] = useState('')
  const [bioLoading, setBioLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editBio, setEditBio] = useState('')
  const [showVipShop, setShowVipShop] = useState(false)
  const [answerText, setAnswerText] = useState({})
  const [animationColor, setAnimationColor] = useState('hsl(0, 100%, 50%)')

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
        setEditBio(profileData.bio || '')

        const { data: questionsData } = await supabase
          .from('bio_questions')
          .select('*')
          .eq('to_user_id', profileData.id)
          .order('created_at', { ascending: false })

        setBioQuestions(questionsData || [])

        if (user?.id === profileData.id) {
          loadMyQuestions(user.id)

          if (location.state?.scrollToTab === 'sent') {
            setTimeout(() => {
              const elem = document.getElementById(`my-answer-section-${location.state.scrollToQuestion}`)
              if (elem) {
                elem.scrollIntoView({ behavior: 'smooth', block: 'center' })
                elem.classList.add('animate-pulse')
              }
            }, 500)
          }
        }
      } catch (err) {
        console.error('Load error:', err)
        navigate('/')
      }
      setLoading(false)
    }

    load()
  }, [username, navigate, user, location])

  // Animasyon loop
  useEffect(() => {
    const interval = setInterval(() => {
      const time = (Date.now() / 10) % 360
      setAnimationColor(`hsl(${time}, 100%, 50%)`)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const loadMyQuestions = async (userId) => {
    try {
      const { data } = await supabase
        .from('bio_questions')
        .select('*')
        .eq('from_user_id', userId)
        .order('created_at', { ascending: false })

      setMyQuestions(data || [])
    } catch (err) {
      console.error('Load my questions error:', err)
    }
  }

  const handleSendBioQuestion = async () => {
    if (!bioText.trim() || !profile) return

    setBioLoading(true)

    try {
      const { data: newQuestion } = await supabase.from('bio_questions').insert({
        to_user_id: profile.id,
        from_user_id: user?.id || null,
        question: bioText.trim(),
        is_anonymous: !user,
        is_answered: false
      }).select()

      setBioText('')
      setShowBioModal(false)
      setMyQuestions(prev => [...(newQuestion || []), ...prev])
      alert('Soru gönderildi! ✅')
    } catch (err) {
      console.error('Question error:', err)
      alert('Soru gönderilemedi')
    }

    setBioLoading(false)
  }

  const handleUpdateBio = async () => {
    if (!profile) return

    try {
      await supabase
        .from('profiles')
        .update({ bio: editBio })
        .eq('id', profile.id)

      setProfile(prev => ({ ...prev, bio: editBio }))
      setIsEditing(false)
      alert('Bio güncellendi! ✅')
    } catch (err) {
      alert('Bio güncellenemedi')
    }
  }

  const handleAnswerQuestion = async (questionId) => {
    const answer = answerText[questionId]?.trim()
    if (!answer) return

    try {
      await supabase
        .from('bio_questions')
        .update({ answer, is_answered: true })
        .eq('id', questionId)

      setBioQuestions(prev =>
        prev.map(q => q.id === questionId ? { ...q, answer, is_answered: true } : q)
      )
      setAnswerText(prev => ({ ...prev, [questionId]: '' }))
      alert('Cevap verildi! ✅')
    } catch (err) {
      alert('Cevap kaydedilemedi')
    }
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

  const isOwnProfile = user?.id === profile.id
  const nickColor = profile.nick_color || '#8B5CF6'

  const allQuestions = [
    ...bioQuestions.map(q => ({ ...q, type: 'received' })),
    ...myQuestions.map(q => ({ ...q, type: 'sent' }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <Link to="/feed" className="brutal-btn px-3 py-2 inline-flex gap-2">
          <ArrowLeft size={18} /> Geri
        </Link>
      </div>

      {/* Profil Header */}
      <div className="brutal-card bg-white dark:bg-dark-card p-8 space-y-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-16 h-16 bg-butter dark:bg-dark-card2 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden relative">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold">{profile.username?.[0]?.toUpperCase()}</span>
              )}
              <ProfileEffect effectId={profile.active_effect} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 
                  className="font-heading font-black text-3xl"
                  style={{ color: profile.is_vip ? animationColor : 'inherit' }}
                >
                  @{profile.username}
                </h1>
                {profile.is_vip && <Crown size={24} className="text-yellow-500" />}
              </div>
              
              <div className="mt-3">
                {isOwnProfile && isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      className="brutal-input resize-none h-20 text-sm"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      maxLength={200}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateBio}
                        className="brutal-btn btn-signal text-sm flex-1"
                      >
                        Kaydet
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="brutal-btn text-sm flex-1"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-body text-ink/60 dark:text-dark-muted">
                      {profile.bio || 'Bio yok'}
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-signal font-heading font-bold mt-2 hover:underline flex items-center gap-1"
                      >
                        <Edit size={14} /> Bio Düzenle
                      </button>
                    )}
                  </>
                )}
              </div>

              <p className="text-sm text-signal font-heading font-bold mt-3">
                💰 {profile.coins} Coin
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {isOwnProfile && !profile.is_vip && (
              <button
                onClick={() => setShowVipShop(true)}
                className="brutal-btn btn-signal px-3 py-2 gap-2 text-sm"
              >
                <Crown size={16} /> VIP Satın Al
              </button>
            )}
            {isOwnProfile && profile.is_vip && (
              <Link
                to="/effects"
                className="brutal-btn btn-signal px-3 py-2 gap-2 text-sm"
              >
                🎨 Efektler
              </Link>
            )}
            {!isOwnProfile && (
              <button
                onClick={() => setShowBioModal(true)}
                className="brutal-btn btn-signal px-3 py-2 gap-2 text-sm"
              >
                <Send size={16} /> Soru Sor
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sorular */}
      <div className="space-y-4">
        <h2 className="font-heading font-bold text-2xl">Sorular ({allQuestions.length})</h2>

        {allQuestions.length === 0 ? (
          <div className="brutal-card bg-butter dark:bg-dark-card2 p-8 text-center space-y-4">
            <p className="font-heading font-bold">Henüz soru yok</p>
            <p className="text-sm text-ink/50">İlk soruyu sen sor!</p>
            {!isOwnProfile && (
              <button
                onClick={() => setShowBioModal(true)}
                className="brutal-btn btn-signal w-full py-2"
              >
                Soru Sor
              </button>
            )}
          </div>
        ) : (
          allQuestions.map(q => (
            <div
              key={q.id}
              id={q.type === 'sent' ? `my-answer-section-${q.id}` : `answer-section-${q.id}`}
              className={`brutal-card p-6 space-y-3 ${
                q.is_answered ? 'bg-white dark:bg-dark-card' : 'bg-lavender dark:bg-dark-card2'
              }`}
            >
              <div>
                {q.type === 'sent' ? (
                  <p className="font-heading font-bold text-sm text-signal">
                    🔵 Sorduğum: @{q.to_user_id}
                  </p>
                ) : (
                  <p className="font-heading font-bold text-sm text-signal">
                    {q.is_anonymous ? '🔒 Anonim' : `👤 @${q.from_user_id}`}
                  </p>
                )}
                <p className="font-body text-lg mt-2">{q.question}</p>
              </div>

              {q.is_answered ? (
                <div className="p-4 bg-signal/5 border-l-4 border-signal rounded">
                  <p className="text-xs font-heading font-bold text-signal mb-2">✓ Cevap</p>
                  <p className="font-body text-sm">{q.answer}</p>
                </div>
              ) : q.type === 'received' && isOwnProfile ? (
                <div className="space-y-2 pt-3 border-t border-ink/10">
                  <textarea
                    placeholder="Cevap yaz..."
                    maxLength={200}
                    value={answerText[q.id] || ''}
                    onChange={(e) => setAnswerText(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className="brutal-input resize-none h-20 text-sm"
                  />
                  <button
                    onClick={() => handleAnswerQuestion(q.id)}
                    disabled={!answerText[q.id]?.trim()}
                    className="brutal-btn btn-signal w-full py-2 text-sm disabled:opacity-50"
                  >
                    Cevapla
                  </button>
                </div>
              ) : (
                <p className="text-xs text-ink/40 italic">
                  {q.type === 'sent' ? '⏳ Cevap bekleniyor...' : 'Henüz cevap yok'}
                </p>
              )}
            </div>
          ))
        )}

        {!isOwnProfile && allQuestions.length > 0 && (
          <div className="text-center pt-4">
            <button
              onClick={() => setShowBioModal(true)}
              className="brutal-btn btn-signal px-6 py-2"
            >
              Soru Sor
            </button>
          </div>
        )}
      </div>

      {/* Bio Soru Modal */}
      {showBioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="brutal-card bg-white dark:bg-dark-card p-8 max-w-md w-full space-y-4">
            <h2 className="font-heading font-bold text-2xl">
              @{profile.username} Sorusu
            </h2>

            <textarea
              className="brutal-input resize-none h-24"
              placeholder="Sorunuzu yazın..."
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              maxLength={200}
            />

            <p className="text-xs text-ink/40">{bioText.length}/200</p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowBioModal(false)}
                className="brutal-btn flex-1"
              >
                İptal
              </button>
              <button
                onClick={handleSendBioQuestion}
                disabled={bioLoading || !bioText.trim()}
                className="brutal-btn btn-signal flex-1 gap-2 disabled:opacity-50"
              >
                {bioLoading ? (
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

      {/* VIP Shop Modal */}
      {showVipShop && (
        <VipShopModal profile={profile} setProfile={setProfile} onClose={() => setShowVipShop(false)} />
      )}
    </div>
  )
}

function VipShopModal({ profile, setProfile, onClose }) {
  const [buying, setBuying] = useState(null)

  const vipPlans = [
    { id: 1, name: '1 Ay VIP', price: 100, days: 30 },
    { id: 3, name: '3 Ay VIP', price: 250, days: 90 },
    { id: 12, name: '1 Yıl VIP', price: 800, days: 365 }
  ]

  const handleBuyVip = async (plan) => {
    if (profile.coins < plan.price) {
      alert('Yeterli coin\'in yok!')
      return
    }

    setBuying(plan.id)

    try {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + plan.days)

      await supabase
        .from('profiles')
        .update({
          is_vip: true,
          vip_until: expiryDate.toISOString(),
          coins: profile.coins - plan.price
        })
        .eq('id', profile.id)

      setProfile(prev => ({
        ...prev,
        is_vip: true,
        vip_until: expiryDate.toISOString(),
        coins: prev.coins - plan.price
      }))

      alert('VIP Satın Alındı! 👑')
      onClose()
    } catch (err) {
      alert('Satın alma başarısız')
    }

    setBuying(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card bg-white dark:bg-dark-card p-8 max-w-md w-full space-y-4">
        <div className="text-center">
          <Crown size={48} className="mx-auto text-yellow-500 mb-2" />
          <h2 className="font-heading font-black text-2xl">VIP Paketleri</h2>
        </div>

        <div className="space-y-2">
          {vipPlans.map(plan => (
            <button
              key={plan.id}
              onClick={() => handleBuyVip(plan)}
              disabled={buying === plan.id || profile.coins < plan.price}
              className="brutal-btn w-full p-4 disabled:opacity-50 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading font-bold">{plan.name}</p>
                  <p className="text-xs text-ink/60">VIP {plan.days} Gün</p>
                </div>
                <p className="font-heading font-bold text-signal">{plan.price} 💰</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-center text-ink/40">
          Senin Coin: {profile.coins}
        </p>

        <button
          onClick={onClose}
          className="brutal-btn w-full py-3"
        >
          Kapat
        </button>
      </div>
    </div>
  )
}
