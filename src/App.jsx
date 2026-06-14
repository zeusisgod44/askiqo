import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import Landing from '@/pages/Landing'
import AuthPage from '@/pages/AuthPage'
import EmailVerification from '@/pages/EmailVerification'
import Feed from '@/pages/Feed'
import AskQuestion from '@/pages/AskQuestion'
import ProfileEffectsShop from '@/pages/ProfileEffectsShop'
import Profile from '@/pages/Profile'
import Inbox from '@/pages/Inbox'
import { Sun, Moon, User, LogOut, Rss, Store, Mail } from 'lucide-react'
import React from 'react'

function ThemeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className="brutal-btn px-3 py-2 text-sm gap-1.5"
      title={dark ? 'Gündüz modu' : 'Gece modu'}
    >
      {dark
        ? <Sun size={17} strokeWidth={2.5} />
        : <Moon size={17} strokeWidth={2.5} />
      }
    </button>
  )
}

function Navbar() {
  const { user, signOut, unreadMessages } = useAuth()
  const username = user?.user_metadata?.username

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
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/feed" className="brutal-btn px-2 md:px-3 py-2 text-xs md:text-sm gap-1 flex-shrink-0">
                <Rss size={14} /> <span className="hidden sm:inline">Akış</span>
              </Link>
              <Link to="/effects" className="brutal-btn px-2 md:px-3 py-2 text-xs md:text-sm gap-1 flex-shrink-0">
                <Store size={14} /> <span className="hidden sm:inline">Efekt</span>
              </Link>
              <Link to="/inbox" className="brutal-btn px-2 md:px-3 py-2 text-xs md:text-sm gap-1 flex-shrink-0 relative">
                <Mail size={14} /> <span className="hidden sm:inline">Inbox</span>
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </Link>
              <Link to={`/u/${username || 'profil'}`} className="brutal-btn px-2 md:px-3 py-2 text-xs md:text-sm gap-1 flex-shrink-0">
                <User size={14} /> <span className="hidden sm:inline">Profil</span>
              </Link>
              <button onClick={signOut} className="brutal-btn px-2 md:px-3 py-2 text-xs md:text-sm gap-1 flex-shrink-0">
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="brutal-btn px-3 py-2 text-xs md:text-sm flex-shrink-0">Giriş</Link>
              <Link to="/register" className="brutal-btn btn-signal px-3 py-2 text-xs md:text-sm flex-shrink-0">Kayıt</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function PrivateRoute({ children }) {
  const { user, loading, emailVerified } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-heading font-bold text-ink/40 dark:text-dark-muted">
        Yükleniyor...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!emailVerified) {
    return <Navigate to="/verify-email" replace />
  }

  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-paper dark:bg-dark-bg transition-colors duration-200">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/feed" /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/feed" /> : <AuthPage mode="login" />} />
          <Route path="/register" element={user ? <Navigate to="/feed" /> : <AuthPage mode="register" />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/ask" element={<PrivateRoute><AskQuestion /></PrivateRoute>} />
          <Route path="/effects" element={<PrivateRoute><ProfileEffectsShop /></PrivateRoute>} />
          <Route path="/inbox" element={<PrivateRoute><Inbox /></PrivateRoute>} />
          <Route path="/u/:username" element={<Profile />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
