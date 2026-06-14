import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon, LogOut, Rss, Store, Bell } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)

  useEffect(() => {
    if (!user) return

    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('username, nick_color, is_vip, avatar_url')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data)
    }

    loadProfile()
    loadNotifications()

    const interval = setInterval(loadNotifications, 1000)
    return () => clearInterval(interval)
  }, [user])

  const loadNotifications = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('bio_questions')
        .select('*', { count: 'exact' })
        .eq('to_user_id', user.id)
        .eq('is_answered', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error('Load notifications error:', err)
    }
  }

  const handleNotificationClick = (notif) => {
    navigate(`/u/${profile.username}`, { state: { scrollToTab: 'sent', scrollToQuestion: notif.id } })
    
    // Bildirim sayısını sıfırla - tüm soruları okunmuş olarak işaretle
    supabase
      .from('bio_questions')
      .update({ is_read: true })
      .eq('to_user_id', user.id)
      .then(() => {
        setNotifications([])
        setShowNotifications(false)
      })
  }

  const handleBellClick = () => {
    if (!showNotifications && notifications.length > 0) {
      // Bell'e basıldığında bildirimleri oku olarak işaretle
      supabase
        .from('bio_questions')
        .update({ is_read: true })
        .eq('to_user_id', user.id)
        .eq('is_answered', true)
        .then(() => {
          setNotifications([])
        })
    }
    setShowNotifications(!showNotifications)
  }

  const username = user?.user_metadata?.username || profile?.username
  const nickColor = profile?.nick_color || '#8B5CF6'
  const isVip = profile?.is_vip

  return (
    <nav className="border-b-2 border-ink dark:border-dark-border bg-paper dark:bg-dark-bg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          to={user ? '/feed' : '/'}
          className="flex-shrink-0 h-12 flex items-center hover:opacity-80 transition-opacity"
        >
          <img 
            src="/logo.png" 
            alt="askiqo" 
            className="h-full object-contain"
          />
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {user ? (
            <>
              <Link to="/feed" className="brutal-btn px-2 md:px-3 py-2 text-xs md:text-sm gap-1 flex-shrink-0">
                <Rss size={14} /> <span className="hidden sm:inline">Akış</span>
              </Link>
              <Link to="/effects" className="brutal-btn px-2 md:px-3 py-2 text-xs md:text-sm gap-1 flex-shrink-0">
                <Store size={14} /> <span className="hidden sm:inline">Efekt</span>
              </Link>

              {/* Divider */}
              <div className="w-px h-6 bg-ink/20 dark:bg-dark-border mx-1"></div>

              {/* Notifications Bell */}
              <button
                ref={notificationRef}
                onClick={handleBellClick}
                className="brutal-btn px-2 md:px-3 py-2 text-xs md:text-sm gap-1 flex-shrink-0 relative"
                title="Bildirimler"
              >
                <Bell size={14} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-heading font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggle}
                className="brutal-btn px-2 md:px-3 py-2 text-xs md:text-sm gap-1.5 flex-shrink-0"
                title={dark ? 'Gündüz modu' : 'Gece modu'}
              >
                {dark
                  ? <Sun size={14} strokeWidth={2.5} />
                  : <Moon size={14} strokeWidth={2.5} />
                }
              </button>

              {/* Profile Avatar + SignOut */}
              <Link
                to={`/u/${username || 'profil'}`}
                className="brutal-btn px-2 md:px-3 py-2 text-xs md:text-sm gap-2 flex-shrink-0 flex items-center"
              >
                <div className="w-5 h-5 rounded-full bg-butter dark:bg-dark-card2 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold">{username?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                {isVip && <span className="text-yellow-500" title="VIP">👑</span>}
                <span className="hidden sm:inline font-heading font-bold text-xs">{username}</span>
              </Link>

              <button
                onClick={signOut}
                className="brutal-btn px-2 md:px-3 py-2 text-xs md:text-sm gap-1 flex-shrink-0"
                title="Çıkış Yap"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggle}
                className="brutal-btn px-2 md:px-3 py-2 text-xs md:text-sm gap-1.5"
                title={dark ? 'Gündüz modu' : 'Gece modu'}
              >
                {dark
                  ? <Sun size={14} strokeWidth={2.5} />
                  : <Moon size={14} strokeWidth={2.5} />
                }
              </button>
              <Link to="/login" className="brutal-btn px-3 py-2 text-xs md:text-sm flex-shrink-0">Giriş</Link>
              <Link to="/register" className="brutal-btn btn-signal px-3 py-2 text-xs md:text-sm flex-shrink-0">Kayıt</Link>
            </>
          )}
        </div>
      </div>

      {/* Notifications Dropdown - Bell'in altında */}
      {showNotifications && user && (
        <div className="border-t-2 border-ink dark:border-dark-border bg-paper dark:bg-dark-bg absolute right-4 top-16 w-80 max-h-96 overflow-y-auto brutal-card z-50">
          <div className="p-4 space-y-3">
            <h3 className="font-heading font-bold text-lg">Bildirimler</h3>
            
            {notifications.length === 0 ? (
              <p className="text-sm text-ink/40">Bildirim yok</p>
            ) : (
              <div className="space-y-2">
                {notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className="brutal-card bg-lavender dark:bg-dark-card2 p-3 w-full text-left hover:bg-signal/10 transition-all"
                  >
                    <p className="font-body text-sm">
                      <span className="font-heading font-bold text-signal">
                        {notif.is_anonymous ? '🔒 Anonim' : '👤 Biri'}
                      </span>
                      {' '}sana soruya cevap verdi! 📧
                    </p>
                    <p className="text-xs text-ink/50 mt-1 italic">"{notif.question}"</p>
                    <span className="text-xs text-signal font-heading font-bold mt-2 inline-block hover:underline">
                      Cevabı Gör →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
