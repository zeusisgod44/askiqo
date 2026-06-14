import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Loader2, ArrowLeft, Pipette } from 'lucide-react'

export default function ThemeSettings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nickColor, setNickColor] = useState('#8B5CF6')
  const [colorPresets] = useState([
    { name: 'Mor', color: '#8B5CF6' },
    { name: 'Pembe', color: '#EC4899' },
    { name: 'Kırmızı', color: '#EF4444' },
    { name: 'Turuncu', color: '#F97316' },
    { name: 'Sarı', color: '#EAB308' },
    { name: 'Yeşil', color: '#22C55E' },
    { name: 'Mavi', color: '#3B82F6' },
    { name: 'Cyan', color: '#06B6D4' },
  ])

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

        if (!profileData.is_vip) {
          navigate(`/u/${profileData.username}`)
          return
        }

        setProfile(profileData)
        setNickColor(profileData.nick_color || '#8B5CF6')
      } catch (err) {
        console.error('Load error:', err)
        navigate('/feed')
      }
      setLoading(false)
    }

    load()
  }, [user, navigate])

  const handleSaveColor = async () => {
    if (!profile) return

    setSaving(true)

    try {
      await supabase
        .from('profiles')
        .update({ nick_color: nickColor })
        .eq('id', profile.id)

      setProfile(prev => ({ ...prev, nick_color: nickColor }))
      alert('Nick rengi güncellendi! 🎨')
    } catch (err) {
      alert('Kaydetme başarısız')
    }

    setSaving(false)
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
    <div className="max-w-2xl mx-auto py-6">
      <Link to={`/u/${profile.username}`} className="brutal-btn px-3 py-2 mb-6 inline-flex gap-2">
        <ArrowLeft size={18} /> Geri
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-black text-4xl mb-2">🎨 Nick Rengi</h1>
        <p className="text-ink/60 dark:text-dark-muted">
          VIP hesabın için özel bir nick rengi seç
        </p>
      </div>

      {/* Nick Preview */}
      <div className="brutal-card bg-white dark:bg-dark-card p-8 mb-8">
        <p className="text-sm text-ink/40 dark:text-dark-muted mb-3 font-heading font-bold">
          ÖNIZLEME
        </p>
        <div className="flex items-center gap-4">
          <h2 
            className="font-heading font-black text-4xl animate-pulse"
            style={{
              color: nickColor,
              textShadow: `0 0 20px ${nickColor}80`
            }}
          >
            @{profile.username}
          </h2>
          <span className="text-yellow-500">👑</span>
        </div>
        <p className="text-xs text-ink/40 dark:text-dark-muted mt-4">
          Navbar ve profilde böyle gözükecek
        </p>
      </div>

      {/* Color Presets */}
      <div className="brutal-card bg-white dark:bg-dark-card p-8 mb-8">
        <h3 className="font-heading font-bold text-xl mb-4">Preset Renkler</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {colorPresets.map(preset => (
            <button
              key={preset.color}
              onClick={() => setNickColor(preset.color)}
              className={`brutal-card p-4 text-center transition-all ${
                nickColor === preset.color ? 'ring-2 ring-offset-2 ring-signal' : ''
              }`}
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 shadow-lg"
                style={{ backgroundColor: preset.color }}
              />
              <p className="text-sm font-heading font-bold">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div className="brutal-card bg-white dark:bg-dark-card p-8 mb-8">
        <h3 className="font-heading font-bold text-xl mb-4 flex items-center gap-2">
          <Pipette size={20} /> Özel Renk
        </h3>
        
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <label className="block text-sm font-heading font-bold mb-2">
              Hex Renk Kodu
            </label>
            <input
              type="text"
              value={nickColor}
              onChange={(e) => setNickColor(e.target.value)}
              placeholder="#8B5CF6"
              className="brutal-input w-full"
              maxLength={7}
            />
            <p className="text-xs text-ink/40 dark:text-dark-muted mt-2">
              Örnek: #FF5733, #00FF00
            </p>
          </div>

          <div className="flex-shrink-0">
            <label className="block text-sm font-heading font-bold mb-2">
              Renk
            </label>
            <input
              type="color"
              value={nickColor}
              onChange={(e) => setNickColor(e.target.value)}
              className="w-20 h-20 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* RGB Animation Info */}
      <div className="brutal-card bg-lavender dark:bg-dark-card2 p-6 mb-8">
        <p className="text-sm text-ink/60 dark:text-dark-muted">
          💡 <span className="font-heading font-bold">İpucu:</span> Seçtiğin renk Navbar'da dalgalı şekilde hareket eder!
        </p>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/u/${profile.username}`)}
          className="brutal-btn flex-1 py-3"
        >
          İptal
        </button>
        <button
          onClick={handleSaveColor}
          disabled={saving}
          className="brutal-btn btn-signal flex-1 py-3 disabled:opacity-50 gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin inline" /> Kaydediliyor...
            </>
          ) : (
            '💾 Kaydet'
          )}
        </button>
      </div>
    </div>
  )
}
