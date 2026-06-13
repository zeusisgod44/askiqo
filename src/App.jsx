import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import Landing from '@/pages/Landing'
import AuthPage from '@/pages/AuthPage'
import Feed from '@/pages/Feed'
import AskQuestion from '@/pages/AskQuestion'
import ProfileEffectsShop from '@/pages/ProfileEffectsShop'
import Profile from '@/pages/Profile'
import { Sun, Moon, User, LogOut, Rss, Settings, Store } from 'lucide-react'
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
  const { user, signOut } = useAuth()
  const username = user?.user_metadata?.username

  return (
    <nav className="border-b-2 border-ink dark:border-dark-border bg-paper dark:bg-dark-bg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link
          to={user ? '/feed' : '/'}
          className="font-heading font-black text-lg md:text-xl tracking-tight text-ink dark:text-dark-text flex-shrink-0"
        >
          askiqo<span className="text-signal">.</span>
        </Link>
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
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-64 font-heading font-bold text-ink/40 dark:text-dark-muted">
      Yükleniyor...
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
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
          <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/ask" element={<PrivateRoute><AskQuestion /></PrivateRoute>} />
          <Route path="/effects" element={<PrivateRoute><ProfileEffectsShop /></PrivateRoute>} />
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
