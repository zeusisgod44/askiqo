import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ArrowRight, Loader2 } from 'lucide-react'

export default function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register'
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = isRegister
      ? await signUp(form.email, form.password, form.username)
      : await signIn(form.email, form.password)

    setLoading(false)

    if (authError) {
      setError(authError.message || 'Bir hata oluştu')
    } else {
      navigate(isRegister ? `/u/${form.username}` : '/feed')
    }
  }

  return (
    <div className="max-w-md mx-auto py-20">
      <div className="brutal-card bg-white dark:bg-dark-card p-8 space-y-6">
        <div className="space-y-1">
          <span className="chip text-xs">
            {isRegister ? 'Yeni hesap' : 'Tekrar hoş geldin'}
          </span>
          <h1 className="font-heading font-black text-3xl mt-3">
            {isRegister ? 'Hesap oluştur' : 'Giriş yap'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="font-heading font-bold text-sm">Kullanıcı adı</label>
              <input
                className="brutal-input"
                name="username"
                placeholder="ahmet"
                value={form.username}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-ink/50">soruver.app/u/{form.username || 'kullanicin'}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-heading font-bold text-sm">E-posta</label>
            <input
              className="brutal-input"
              name="email"
              type="email"
              placeholder="ornek@mail.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-heading font-bold text-sm">Şifre</label>
            <input
              className="brutal-input"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div className="brutal-card bg-peach dark:bg-dark-card2 p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="brutal-btn btn-signal w-full py-3 gap-2 justify-center"
          >
            {loading
              ? <Loader2 size={18} className="animate-spin" />
              : <>{isRegister ? 'Hesap oluştur' : 'Giriş yap'} <ArrowRight size={18} strokeWidth={3} /></>
            }
          </button>
        </form>

        <p className="text-center text-sm text-ink/60">
          {isRegister ? 'Zaten hesabın var mı?' : 'Hesabın yok mu?'}{' '}
          <Link
            to={isRegister ? '/login' : '/register'}
            className="font-bold text-signal underline"
          >
            {isRegister ? 'Giriş yap' : 'Kayıt ol'}
          </Link>
        </p>
      </div>
    </div>
  )
}
