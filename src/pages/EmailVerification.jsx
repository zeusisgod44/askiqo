import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Mail, CheckCircle, AlertCircle, Loader2, Copy, Check } from 'lucide-react'

export default function EmailVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, emailVerified } = useAuth()

  const [status, setStatus] = useState('waiting') // waiting, verified, error, resent
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [resending, setResending] = useState(false)
  const [copied, setCopied] = useState(false)
  const email = location.state?.email || user?.email || ''
  const needsVerification = location.state?.needsVerification || false

  useEffect(() => {
    async function checkVerification() {
      const token = new URLSearchParams(location.search).get('token_hash')
      const type = new URLSearchParams(location.search).get('type')

      if (token && type === 'signup') {
        // Email linki tıklandı
        try {
          setLoading(true)
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          })

          if (error) throw error

          setStatus('verified')
          setMessage('Email başarıyla doğrulandı! Giriş ekranına yönlendiriliyorsun...')
          
          setTimeout(() => {
            navigate('/login')
          }, 2000)
          return
        } catch (err) {
          console.error('Verification error:', err)
          setStatus('error')
          setMessage('Doğrulama başarısız: ' + (err.message || 'Linkin süresi dolmuş olabilir'))
          setLoading(false)
          return
        }
      }

      // Ilk ziyaret - email gir
      if (user && emailVerified) {
        // Zaten verified ise feed'e git
        navigate('/feed')
      } else {
        setLoading(false)
      }
    }

    checkVerification()
  }, [location.search, user, emailVerified, navigate])

  const handleResendEmail = async () => {
    if (!email) return

    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (error) throw error

      setStatus('resent')
      setMessage('Doğrulama e-postası yeniden gönderildi! Spam klasörünü kontrol et.')
      
      setTimeout(() => {
        setStatus('waiting')
        setMessage('')
      }, 3000)
    } catch (err) {
      alert('Email gönderilemedi: ' + err.message)
    }
    setResending(false)
  }

  const copyEmail = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-signal" />
      </div>
    )
  }

  // Başarılı doğrulama
  if (status === 'verified') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-paper dark:bg-dark-bg px-4">
        <div className="brutal-card bg-white dark:bg-dark-card p-8 max-w-md w-full text-center space-y-6">
          <CheckCircle size={64} className="mx-auto text-signal" />
          <div>
            <h1 className="font-heading font-black text-3xl text-ink dark:text-dark-text">
              Başarılı!
            </h1>
            <p className="font-body text-ink/60 dark:text-dark-muted mt-2">
              {message}
            </p>
          </div>
          <div className="animate-pulse">
            <Loader2 size={24} className="mx-auto text-signal animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  // Doğrulama hatası
  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-paper dark:bg-dark-bg px-4">
        <div className="brutal-card bg-white dark:bg-dark-card p-8 max-w-md w-full text-center space-y-6">
          <AlertCircle size={64} className="mx-auto text-red-500" />
          <div>
            <h1 className="font-heading font-black text-3xl text-ink dark:text-dark-text">
              Hata!
            </h1>
            <p className="font-body text-red-600 mt-2">
              {message}
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="brutal-btn btn-signal w-full py-3 disabled:opacity-50"
            >
              {resending ? (
                <Loader2 size={18} className="animate-spin inline" />
              ) : (
                'Linki Yeniden Gönder'
              )}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="brutal-btn w-full py-3"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Email doğrulama bekleme sayfası
  return (
    <div className="flex items-center justify-center min-h-screen bg-paper dark:bg-dark-bg px-4 py-8">
      <div className="brutal-card bg-white dark:bg-dark-card p-8 max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Mail size={64} className="mx-auto text-signal mb-4" />
          <h1 className="font-heading font-black text-3xl text-ink dark:text-dark-text">
            Email Doğrula
          </h1>
        </div>

        {/* Message */}
        <div className="brutal-card bg-lavender dark:bg-dark-card2 p-6 space-y-3 text-center">
          <p className="font-heading font-bold text-lg">
            Hoş geldin! 🎉
          </p>
          <p className="font-body text-ink/60 dark:text-dark-muted text-sm">
            Hesabını tamamlamak için <strong>{email}</strong> adresine gönderilen linki tıkla.
          </p>
          {needsVerification && (
            <p className="font-body text-red-600 text-sm border-t border-ink/10 dark:border-dark-border pt-3">
              ⚠️ Email doğrulanana kadar uygulamayı kullanamayacaksın.
            </p>
          )}
        </div>

        {/* Resent message */}
        {status === 'resent' && (
          <div className="brutal-card bg-butter dark:bg-dark-card2 p-3 text-center text-sm font-body">
            ✓ {message}
          </div>
        )}

        {/* Email copy button */}
        <button
          onClick={copyEmail}
          className="brutal-btn w-full py-2 text-sm flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check size={16} /> Kopyalandı
            </>
          ) : (
            <>
              <Copy size={16} /> {email}
            </>
          )}
        </button>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="brutal-btn w-full py-3 disabled:opacity-50"
          >
            {resending ? (
              <Loader2 size={18} className="animate-spin inline mr-2" />
            ) : null}
            Linki Yeniden Gönder
          </button>
          <button
            onClick={() => navigate('/login')}
            className="brutal-btn btn-signal w-full py-3"
          >
            Giriş Sayfasına Git
          </button>
        </div>

        {/* Footer */}
        <div className="space-y-2 text-xs text-center text-ink/40 dark:text-dark-muted border-t border-ink/10 dark:border-dark-border pt-4">
          <p>Email almadıysan spam klasörünü kontrol et</p>
          <p>Doğrulama linki 24 saat içinde geçerli</p>
        </div>
      </div>
    </div>
  )
}
