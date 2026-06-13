import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { PROFILE_EFFECTS } from '@/constants'
import { Check, Lock, Loader2 } from 'lucide-react'
import { ProfileEffect } from '@/components/ProfileEffects'

export default function ProfileEffectsShop() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [ownedEffects, setOwnedEffects] = useState([])
  const [selectedEffect, setSelectedEffect] = useState('none')
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      setProfile(profileData)
      setSelectedEffect(profileData?.active_effect || 'none')

      const { data: effectsData } = await supabase
        .from('profile_effects')
        .select('effect_id')
        .eq('user_id', user?.id)

      const owned = effectsData?.map(e => e.effect_id) || []
      setOwnedEffects(['none', ...owned])
      setLoading(false)
    }
    load()
  }, [user?.id])

  const handleBuyEffect = async (effect) => {
    if (!user || profile.coins < effect.price) return

    setBuying(effect.id)

    // Buy effect
    await supabase.from('profile_effects').insert({
      user_id: user.id,
      effect_id: effect.id
    })

    // Deduct coins
    await supabase
      .from('profiles')
      .update({ coins: profile.coins - effect.price })
      .eq('id', user.id)

    setOwnedEffects([...ownedEffects, effect.id])
    setProfile({ ...profile, coins: profile.coins - effect.price })
    setBuying(null)
  }

  const handleSelectEffect = async (effectId) => {
    setSelectedEffect(effectId)
    await supabase
      .from('profiles')
      .update({ active_effect: effectId })
      .eq('id', user.id)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={32} className="animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <div>
        <span className="chip">profil efektleri</span>
        <h1 className="font-heading font-black text-4xl mt-2">Efekt Mağazası</h1>
      </div>

      {/* Coins Balance */}
      <div className="brutal-card bg-signal text-white p-6">
        <p className="text-sm opacity-90">Senin Coinlerin</p>
        <p className="font-heading font-black text-4xl">💰 {profile?.coins || 0}</p>
      </div>

      {/* Preview */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="brutal-card bg-white dark:bg-dark-card p-8">
          <h2 className="font-heading font-bold text-lg mb-4">Önizleme</h2>
          <div className="relative w-32 h-32 mx-auto">
            <div className="avatar lg bg-butter dark:bg-dark-card2 mx-auto relative">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" />
                : profile?.username?.[0]?.toUpperCase()
              }
              <ProfileEffect effectId={selectedEffect} />
            </div>
          </div>
          <p className="text-center mt-4 font-heading font-bold">
            {PROFILE_EFFECTS.find(e => e.id === selectedEffect)?.name}
          </p>
        </div>

        {/* Info */}
        <div className="brutal-card bg-lavender dark:bg-dark-card2 p-6 space-y-4">
          <h2 className="font-heading font-bold text-lg">Bilgi</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Seçili Efekt:</strong> {PROFILE_EFFECTS.find(e => e.id === selectedEffect)?.name}</p>
            <p><strong>Sahip Efektler:</strong> {ownedEffects.length}</p>
          </div>
          <div className="border-t-2 border-ink/10 pt-4 space-y-2">
            <p className="text-xs font-heading font-bold">Coin Kazanma:</p>
            <ul className="text-xs space-y-1">
              <li>✓ Soru atılırsa: +10</li>
              <li>✓ Cevap beğenilirse: +5</li>
              <li>✓ Aylık bonus: +50</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Effects Grid */}
      <div className="space-y-4">
        <h2 className="font-heading font-bold text-2xl">Tüm Efektler</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {PROFILE_EFFECTS.map(effect => {
            const isOwned = ownedEffects.includes(effect.id)
            const isSelected = selectedEffect === effect.id

            return (
              <div
                key={effect.id}
                className={`brutal-card p-5 space-y-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-signal scale-105 bg-signal/5'
                    : 'border-ink/20 dark:border-dark-border'
                }`}
              >
                {/* Preview Mini */}
                <div className="relative w-20 h-20 mx-auto">
                  <div className="avatar sm bg-butter dark:bg-dark-card2 mx-auto relative">
                    A
                    <ProfileEffect effectId={effect.id} />
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-heading font-bold text-lg">{effect.name}</h3>
                  <p className="text-xs text-ink/60 dark:text-dark-muted">{effect.description}</p>
                </div>

                {/* Status */}
                {isOwned ? (
                  <button
                    onClick={() => handleSelectEffect(effect.id)}
                    className={`brutal-btn w-full py-2 text-sm ${
                      isSelected ? 'btn-signal' : ''
                    }`}
                  >
                    <Check size={14} /> {isSelected ? 'Seçili' : 'Seç'}
                  </button>
                ) : effect.price === 0 ? (
                  <div className="text-center text-signal font-heading font-bold text-sm">
                    Ücretsiz
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuyEffect(effect)}
                    disabled={profile?.coins < effect.price || buying === effect.id}
                    className="brutal-btn btn-signal w-full py-2 text-sm disabled:opacity-50 gap-1 justify-center"
                  >
                    {buying === effect.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Lock size={14} /> {effect.price} 💰
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
