import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { CATEGORIES } from '@/constants'
import { Send, Loader2, ArrowLeft, Search } from 'lucide-react'

export default function AskQuestion() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState('game')
  const [target, setTarget] = useState('all')
  const [targetUsername, setTargetUsername] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Username arama
  const handleUsernameSearch = async (value) => {
    setTargetUsername(value)
    
    if (!value.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', `%${value}%`)
        .limit(5)

      setSearchResults(data || [])
    } catch (err) {
      console.error('Search error:', err)
    }
    setSearching(false)
  }

  const handleSelectUser = (username) => {
    setTargetUsername(username)
    setSearchResults([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!question.trim()) {
      setError('Soru boş olamaz')
      return
    }

    setLoading(true)
    setError('')

    try {
      let targetUserId = null

      if (target === 'specific') {
        if (!targetUsername.trim()) {
          setError('Kullanıcı adı gir')
          setLoading(false)
          return
        }

        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', targetUsername.trim())
          .single()

        if (userError || !userData) {
          setError('Kullanıcı bulunamadı')
          setLoading(false)
          return
        }
        targetUserId = userData.id
      }

      const { error: insertError } = await supabase
        .from('public_messages')
        .insert({
          content: question.trim(),
          category,
          to_user_id: targetUserId,
          asked_by_user_id: user.id,
          likes: 0
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        setError(insertError.message || 'Soru gönderilemedi')
        setLoading(false)
        return
      }

      await supabase
        .from('profiles')
        .update({ coins: (user?.user_metadata?.coins || 0) + 10 })
        .eq('id', user.id)

      setTimeout(() => {
        navigate('/feed')
      }, 500)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Bir hata oluştu')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="brutal-btn px-3 py-2"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-heading font-black text-2xl">Soru Sor</h1>
      </div>

      <form onSubmit={handleSubmit} className="brutal-card bg-white dark:bg-dark-card p-6 space-y-6">
        {/* Sorunun metni */}
        <div className="space-y-2">
          <label className="font-heading font-bold text-sm">Sorun</label>
          <textarea
            className="brutal-input resize-none h-32"
            placeholder="Merak ettiğin şeyi sor..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={500}
          />
          <p className="text-xs text-ink/40 dark:text-dark-muted">{question.length}/500</p>
        </div>

        {/* Kategori */}
        <div className="space-y-2">
          <label className="font-heading font-bold text-sm">Kategori</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'game', emoji: '🎮', name: 'Oyun' },
              { id: 'music', emoji: '🎵', name: 'Müzik' },
              { id: 'film', emoji: '🎬', name: 'Film' },
              { id: 'series', emoji: '📺', name: 'Dizi' },
              { id: 'sports', emoji: '⚽', name: 'Spor' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`brutal-btn py-2 text-sm ${
                  category === cat.id ? 'bg-signal text-white' : 'bg-white dark:bg-dark-card'
                }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Kime Sor */}
        <div className="space-y-2">
          <label className="font-heading font-bold text-sm">Kime Sor?</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTarget('all')}
              className={`brutal-btn px-4 py-2 text-sm ${
                target === 'all' ? 'bg-signal text-white' : ''
              }`}
            >
              Herkese
            </button>
            <button
              type="button"
              onClick={() => setTarget('specific')}
              className={`brutal-btn px-4 py-2 text-sm ${
                target === 'specific' ? 'bg-signal text-white' : ''
              }`}
            >
              Spesifik Kişiye
            </button>
          </div>

          {target === 'specific' && (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  className="brutal-input"
                  placeholder="@kullaniciadi ara..."
                  value={targetUsername}
                  onChange={(e) => handleUsernameSearch(e.target.value)}
                  autoComplete="off"
                />
                {searching && <Loader2 size={16} className="absolute right-3 top-3 animate-spin" />}
              </div>

              {/* Arama Sonuçları */}
              {searchResults.length > 0 && (
                <div className="brutal-card bg-paper dark:bg-dark-card2 p-2 space-y-1 max-h-40 overflow-y-auto">
                  {searchResults.map(result => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleSelectUser(result.username)}
                      className="w-full text-left px-3 py-2 hover:bg-signal/10 rounded-lg transition-colors text-sm"
                    >
                      <p className="font-heading font-bold">@{result.username}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hata */}
        {error && (
          <div className="brutal-card bg-peach dark:bg-dark-card2 p-3 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Gönder */}
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="brutal-btn btn-signal w-full py-3 gap-2 justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Gönder</>}
        </button>
      </form>
    </div>
  )
}
