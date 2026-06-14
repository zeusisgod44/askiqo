import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Mail, MessageSquare, Loader2, ArrowLeft, Send } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Inbox() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [unread, setUnread] = useState(0)
  const [replying, setReplying] = useState(null)
  const [replyText, setReplyText] = useState({})
  const [replyLoading, setReplyLoading] = useState(null)

  useEffect(() => {
    async function load() {
      if (!user) return

      try {
        const { data } = await supabase
          .from('direct_messages')
          .select('*')
          .eq('to_user_id', user.id)
          .order('created_at', { ascending: false })

        setMessages(data || [])

        const unreadCount = (data || []).filter(m => !m.is_read).length
        setUnread(unreadCount)

        // Mark notification as false
        if (unreadCount === 0) {
          await supabase
            .from('profiles')
            .update({ has_unread_dms: false })
            .eq('id', user.id)
        }
      } catch (err) {
        console.error('Load error:', err)
      }
      setLoading(false)
    }

    load()
    const interval = setInterval(load, 2000)
    return () => clearInterval(interval)
  }, [user])

  const markAsRead = async (msgId) => {
    await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('id', msgId)

    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, is_read: true } : m)
    )
    setUnread(prev => Math.max(0, prev - 1))
  }

  const handleReply = async (msgId) => {
    const text = replyText[msgId]?.trim()
    if (!text) return

    setReplyLoading(msgId)

    try {
      // Cevabı DM olarak gönder (reversed)
      const msg = messages.find(m => m.id === msgId)
      if (!msg) return

      await supabase.from('direct_messages').insert({
        to_user_id: msg.from_user_id,
        from_user_id: user.id,
        content: text,
        is_anonymous: false,
        is_read: false
      })

      setReplyText(prev => ({ ...prev, [msgId]: '' }))
      setReplying(null)
      alert('Cevap gönderildi! ✅')
    } catch (err) {
      console.error('Reply error:', err)
      alert('Cevap gönderilemedi')
    }

    setReplyLoading(null)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="font-heading font-bold">Giriş yap</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/feed" className="brutal-btn px-3 py-2">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-heading font-black text-2xl">Inbox</h1>
        {unread > 0 && (
          <span className="brutal-btn btn-signal px-3 py-1 text-sm">
            {unread} yeni
          </span>
        )}
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="brutal-card bg-butter dark:bg-dark-card2 p-8 text-center">
            <Mail size={48} className="mx-auto text-ink/30 mb-4" />
            <p className="font-heading font-bold text-lg">Mesaj yok</p>
            <p className="text-sm text-ink/50 mt-2">Profil sayfalarından mesaj alan!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`brutal-card p-6 transition-all ${
                msg.is_read
                  ? 'bg-white dark:bg-dark-card'
                  : 'bg-lavender dark:bg-dark-card2 border-2 border-signal'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-heading font-bold flex items-center gap-2">
                      {msg.is_anonymous ? '🔒 Anonim' : '👤 ' + msg.from_user_id}
                      {!msg.is_read && <span className="w-2 h-2 bg-signal rounded-full"></span>}
                    </p>
                    <p className="font-body text-ink dark:text-dark-text mt-2">
                      {msg.content}
                    </p>
                    <p className="text-xs text-ink/40 dark:text-dark-muted mt-2">
                      {new Date(msg.created_at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <MessageSquare size={20} className="flex-shrink-0 text-signal mt-1" />
                </div>

                {/* Reply Input */}
                {replying === msg.id && (
                  <div className="space-y-2 pt-3 border-t border-ink/10 dark:border-dark-border">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Cevap yaz..."
                        value={replyText[msg.id] || ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [msg.id]: e.target.value }))}
                        className="brutal-input flex-1 py-2 text-sm"
                        maxLength={200}
                      />
                      <button
                        onClick={() => handleReply(msg.id)}
                        disabled={replyLoading === msg.id || !replyText[msg.id]?.trim()}
                        className="brutal-btn btn-signal px-3 py-2 text-sm disabled:opacity-50"
                      >
                        {replyLoading === msg.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Send size={16} />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => setReplying(null)}
                      className="text-xs text-ink/40 hover:text-ink dark:hover:text-dark-text"
                    >
                      İptal
                    </button>
                  </div>
                )}

                {/* Reply Button */}
                {replying !== msg.id && (
                  <button
                    onClick={() => {
                      setReplying(msg.id)
                      markAsRead(msg.id)
                    }}
                    className="text-xs text-signal font-heading font-bold hover:underline"
                  >
                    Cevapla →
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
