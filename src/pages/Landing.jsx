import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ArrowRight, Lock, MessageSquare, Zap } from 'lucide-react'

export default function Landing() {
  const { user } = useAuth()

  if (user) {
    return null // Giriş yapıysa /feed'e yönlendir
  }

  return (
    <div className="space-y-20 pb-16">

      {/* HERO */}
      <section className="grid md:grid-cols-2 gap-10 md:gap-16 items-center pt-10 md:pt-16">
        <div className="space-y-6">
          <span className="chip"><Zap size={12} strokeWidth={3} /> yeni nesil soru platformu</span>
          <h1 className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.93] text-ink dark:text-dark-text">
            Sor.<br />Söylesinler.<br />
            <span className="text-signal">Anonim.</span>
          </h1>
          <p className="font-body text-lg text-ink/60 dark:text-dark-muted max-w-md leading-relaxed">
            Oyun, müzik, film, dizi, spordan insanların düşüncelerini merak ediyor musun? Profilini paylaş, sorular topla, anonim cevaplar al.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="brutal-btn btn-signal px-6 py-3 gap-2">
              Hemen Başla <ArrowRight size={18} strokeWidth={3} />
            </Link>
            <Link to="/login" className="brutal-btn px-6 py-3">Giriş Yap</Link>
          </div>
        </div>

        <div className="relative select-none">
          <div className="brutal-card bg-mint dark:bg-dark-card2 p-7 rotate-[-3deg]">
            <span className="chip">anonim</span>
            <p className="font-heading font-bold text-2xl mt-3">
              En sevdiğin oyun nedir?
            </p>
            <div className="mt-4 p-4 rounded-xl border-2 border-ink dark:border-dark-border bg-white dark:bg-dark-card">
              Elden Ring, hiç oynamadığım halde 😂
            </div>
          </div>
          <div className="brutal-card bg-peach dark:bg-dark-card2 p-6 rotate-[4deg] mt-6 ml-16 md:ml-24">
            <span className="chip">müzik</span>
            <p className="font-heading font-bold text-xl mt-3">Gözüne kestirdiğin artist?</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid md:grid-cols-3 gap-6">
        {[
          { icon: Lock, title: 'Tam Anonim', desc: 'Sorular ve cevaplar tamamıyla anonim kalır.' },
          { icon: MessageSquare, title: 'Kategoriler', desc: 'Oyun, müzik, film, dizi, spor ve daha fazla.' },
          { icon: Zap, title: 'Coin Sistemi', desc: 'Sor ve cevapla, efektler satın al.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="brutal-card bg-lavender dark:bg-dark-card2 p-7">
            <Icon size={32} strokeWidth={2.5} className="text-ink dark:text-dark-text mb-4" />
            <h3 className="font-heading font-bold text-2xl mb-2">{title}</h3>
            <p className="font-body text-ink/60 dark:text-dark-muted">{desc}</p>
          </div>
        ))}
      </section>

      {/* BOTTOM CTA */}
      <section className="brutal-card bg-ink dark:bg-dark-card text-paper p-10 md:p-14 text-center">
        <h2 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter mb-4">
          Merak edilen olmak istiyorsan,<br />herkes merak eder.
        </h2>
        <p className="font-body text-lg text-paper/60 mb-8">Birkaç saniyede başla.</p>
        <Link
          to="/register"
          className="brutal-btn btn-signal px-8 py-4 gap-2"
          style={{ boxShadow: '4px 4px 0px rgba(255,255,255,0.25)' }}
        >
          Kayıt Ol <ArrowRight size={18} strokeWidth={3} />
        </Link>
      </section>
    </div>
  )
}
