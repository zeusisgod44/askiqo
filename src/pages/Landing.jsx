import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LogOut } from 'lucide-react'

export default function Landing() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!user) return

    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, is_vip')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data)
    }

    loadProfile()
  }, [user])

  if (user) {
    navigate('/feed')
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-12 text-center">
        <img 
          src="/logo.png" 
          alt="askiqo" 
          className="h-32 mx-auto mb-8 object-contain"
        />
        <h1 className="font-heading font-black text-5xl mb-2">askiqo</h1>
        <p className="text-lg text-ink/60 dark:text-dark-muted font-body">
          Soru. Söyleşiler. Anonim.
        </p>
      </div>

      {/* Main Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-sm mb-12">
        <Link
          to="/login"
          className="brutal-btn py-4 text-lg font-heading font-bold text-center"
        >
          Giriş Yap
        </Link>
        <Link
          to="/register"
          className="brutal-btn btn-signal py-4 text-lg font-heading font-bold text-center"
        >
          Kayıt Ol
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-12">
        <div className="brutal-card bg-lavender dark:bg-dark-card2 p-6 text-center">
          <p className="text-3xl mb-3">💬</p>
          <h3 className="font-heading font-bold mb-2">Soru Sor</h3>
          <p className="text-sm text-ink/60 dark:text-dark-muted">
            Diğer kullanıcılara anonim olarak soru sor
          </p>
        </div>

        <div className="brutal-card bg-lavender dark:bg-dark-card2 p-6 text-center">
          <p className="text-3xl mb-3">👥</p>
          <h3 className="font-heading font-bold mb-2">Söyleş</h3>
          <p className="text-sm text-ink/60 dark:text-dark-muted">
            Sorulara cevap ver ve tartış
          </p>
        </div>

        <div className="brutal-card bg-lavender dark:bg-dark-card2 p-6 text-center">
          <p className="text-3xl mb-3">🔒</p>
          <h3 className="font-heading font-bold mb-2">Anonim</h3>
          <p className="text-sm text-ink/60 dark:text-dark-muted">
            Kimliğini gizli tut, özgürce konuş
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="brutal-card bg-butter dark:bg-dark-card2 p-8 text-center w-full max-w-md">
        <p className="text-sm text-ink/60 dark:text-dark-muted mb-3 font-heading font-bold">
          askiqo'da neleri görebilirsin
        </p>
        <div className="space-y-2 text-left">
          <p className="font-body">✓ Profil sayfası ve bio</p>
          <p className="font-body">✓ Anonim sorular & cevaplar</p>
          <p className="font-body">✓ VIP özel nicki rengini kişiselleştir</p>
          <p className="font-body">✓ Tema seçeneği (koyu/açık)</p>
          <p className="font-body">✓ Coin sistemi</p>
        </div>
      </div>
    </div>
  )
}
