import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { PROFILE_EFFECTS } from '@/constants'
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react'

const NICK_COLOR_EFFECTS = [
  {
    id: 'nick-purple',
    name: 'Mor Nick',
    description: 'Dalgalı mor renge sahip özel nick',
    price: 50,
    type: 'nick_color',
    color: '#8B5CF6'
  },
  {
    id: 'nick-rainbow',
    name: 'Gökkuşağı Nick',
    description: 'Tüm renklerde dalgalanacak nick',
    price: 100,
    type: 'nick_color',
    color: 'rainbow'
  }
]

export default function ProfileEffectsShop() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [ownedEffects, setOwnedEffects] = useState(new Set())
  const [activeEffect, setActiveEffect] = useState('none')
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(null)
  const [activating, setActivating] = useState(null)

  useEffect(() => {
    async function load() {
      if (!user) {
        navigate('/login')
        return
      }

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!profileData) {
          navigate('/feed')
          return
        }

        setProfile(profileData)
        setActiveEffect(profileData.active_effect || 'none')

        const { data: effects } = await supabase
          .from('profile_effects')
          .select('effect_id')
          .eq('user_id', user.id)

        setOwnedEffects(new Set(effects?.map(e => e.effect_id) || []))
      } catch (err) {
        console.error('Load error:', err)
        navigate('/feed')
      }
      setLoading(false)
    }

    load()
  }, [user, navigate])

  const handleBuyEffect = async (effect) => {
    if (!profile) return

    if (profile.coins < effect.price) {
      alert('Yeterli coin\'in yok!')
      return
    }

    setBuying(effect.id)

    try {
      await supabase.from('profile_effects').insert({
        user_id: profile.id,
        effect_id: effect.id
      })

      await supabase
        .from('profiles')
        .update({ coins: profile.coins - effect.price })
        .eq('id', profile.id)

      setOwnedEffects(prev => new Set([...prev, effect.id]))
      setProfile(prev => ({ ...prev, coins: prev.coins - effect.price }))
      alert('Efekt satın alındı! 🎉')
    } catch (err) {
      console.error('Buy error:', err)
      alert('Satın alma başarısız')
    }

    setBuying(null)
  }

  const handleActivateEffect = async (effectId) => {
    if (!profile) return

    setActivating(effectId)

    try {
      await supabase
        .from('profiles')
        .update({ active_effect: effectId })
        .eq('id', profile.id)

      setActiveEffect(effectId)
    } catch (err) {
      alert('Efekt etkinleştirilemedi')
    }

    setActivating(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Link to={`/u/${profile.username}`} className="brutal-btn px-3 py-2 mb-6 inline-flex gap-2">
        <ArrowLeft size={18} /> Geri
      </Link>

      <div className="mb-8">
        <h1 className="font-heading font-black text-4xl mb-2">✨ Efekt Mağazası</h1>
        <p className="text-ink/60 dark:text-dark-muted">
          Nick rengini ve profil efektlerini kişiselleştir
        </p>
      </div>

      {/* Nick Color Effects */}
      <div className="mb-12">
        <h2 className="font-heading font-bold text-2xl mb-4">🎨 Nick Rengi Efektleri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {NICK_COLOR_EFFECTS.map(effect => {
            const owned = ownedEffects.has(effect.id)

            return (
              <div
                key={effect.id}
                className="brutal-card bg-white dark:bg-dark-card p-6 space-y-4"
              >
                {/* Preview */}
                <div className="h-24 bg-butter dark:bg-dark-card2 rounded-lg flex items-center justify-center overflow-hidden">
                  {effect.color === 'rainbow' ? (
                    <h3 
                      className="font-heading font-black text-2xl animate-pulse"
                      style={{
                        background: 'linear-gradient(90deg, red, yellow, lime, cyan, blue, magenta, red)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      @{profile.username}
                    </h3>
                  ) : (
                    <h3 
                      className="font-heading font-black text-2xl animate-pulse"
                      style={{
                        color: effect.color,
                        textShadow: `0 0 20px ${effect.color}80`
                      }}
                    >
                      @{profile.username}
                    </h3>
                  )}
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-heading font-bold text-lg">{effect.name}</h3>
                  <p className="text-sm text-ink/60 dark:text-dark-muted mt-1">
                    {effect.description}
                  </p>
                </div>

                {/* Price & Button */}
                <div className="flex items-center justify-between pt-2 border-t border-ink/10">
                  <span className="font-heading font-bold text-signal">
                    {effect.price} 💰
                  </span>
                  <button
                    onClick={() => handleBuyEffect(effect)}
                    disabled={buying === effect.id || owned}
                    className={`brutal-btn text-sm ${
                      owned ? 'bg-green-500 text-white' : 'btn-signal'
                    } disabled:opacity-50`}
                  >
                    {owned ? '✓ Sahip' : buying === effect.id ? <Loader2 size={16} className="animate-spin" /> : 'Satın Al'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Theme Settings Link */}
      <div className="brutal-card bg-lavender dark:bg-dark-card2 p-6 mb-12 flex items-center justify-between">
        <div>
          <h3 className="font-heading font-bold text-lg">🎨 Nick Rengini Özelleştir</h3>
          <p className="text-sm text-ink/60 dark:text-dark-muted mt-1">
            Hex kodu ile kendi rengini seçebilirsin
          </p>
        </div>
        <Link
          to="/theme-settings"
          className="brutal-btn btn-signal px-4 py-2 flex-shrink-0"
        >
          Ayarlar →
        </Link>
      </div>

      {/* Profile Effects */}
      <div>
        <h2 className="font-heading font-bold text-2xl mb-4">✨ Profil Animasyonları</h2>
        
        {/* None Effect */}
        <div className="mb-4">
          <button
            onClick={() => handleActivateEffect('none')}
            disabled={activating === 'none'}
            className={`brutal-card w-full p-4 text-left transition-all ${
              activeEffect === 'none' ? 'ring-2 ring-signal' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-heading font-bold text-lg">Efekt Yok</h3>
                <p className="text-sm text-ink/60 dark:text-dark-muted mt-1">
                  Normal profil
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleActivateEffect('none')
                }}
                disabled={activating === 'none'}
                className="brutal-btn text-sm"
              >
                {activeEffect === 'none' ? '✓ Aktif' : 'Seç'}
              </button>
            </div>
          </button>
        </div>

        {/* Other Effects */}
        <div className="space-y-3">
          {PROFILE_EFFECTS.map(effect => {
            const owned = ownedEffects.has(effect.id)
            const isActive = activeEffect === effect.id

            return (
              <div
                key={effect.id}
                className={`brutal-card p-6 space-y-4 ${
                  isActive ? 'ring-2 ring-signal' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg">{effect.name}</h3>
                    <p className="text-sm text-ink/60 dark:text-dark-muted mt-1">
                      {effect.description}
                    </p>
                    <p className="text-xs text-ink/40 dark:text-dark-muted mt-2">
                      💰 {effect.price} coin
                    </p>
                  </div>

                  {/* Emoji Preview - basit ve hafif */}
                  <div className="text-4xl flex-shrink-0 ml-4">
                    ✨
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-2 pt-2 border-t border-ink/10">
                  {!owned ? (
                    <button
                      onClick={() => handleBuyEffect(effect)}
                      disabled={buying === effect.id}
                      className="brutal-btn btn-signal flex-1 text-sm disabled:opacity-50"
                    >
                      {buying === effect.id ? (
                        <Loader2 size={16} className="animate-spin inline" />
                      ) : (
                        `Satın Al - ${effect.price} 💰`
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleActivateEffect(effect.id)}
                        disabled={activating === effect.id || isActive}
                        className={`brutal-btn flex-1 text-sm ${isActive ? 'btn-signal' : ''} disabled:opacity-50`}
                      >
                        {activating === effect.id ? (
                          <Loader2 size={16} className="animate-spin inline" />
                        ) : isActive ? (
                          '✓ Aktif'
                        ) : (
                          'Etkinleştir'
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Coin Info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-ink/60 dark:text-dark-muted mb-2">
          Mevcut Coinler
        </p>
        <p className="font-heading font-black text-3xl text-signal">
          {profile.coins} 💰
        </p>
      </div>
    </div>
  )
}
