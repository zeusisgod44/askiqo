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
import ThemeSettings from '@/pages/ThemeSettings'
import Navbar from '@/components/Navbar'
import React from 'react'

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
          <Route path="/theme-settings" element={<PrivateRoute><ThemeSettings /></PrivateRoute>} />
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
