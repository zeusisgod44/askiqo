import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Send, Loader2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Messages() {
  const { username } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [conversations, setConversations] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!user) return
    
    async function loadConversations() {
      const { data } = await supabase
        .from('direct_messages')
        .select('sender_id, receiver_id, content, is_read, created_at')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (!data) { setLoading(false); return }

      // Unique konuşmaları bul
      const uniqueUsers = new Map()
      data.forEach(msg => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        if (!uniqueUsers.has(otherId)) {
          uniqueUsers.set(otherId, msg)
        }
      })

      // User info'ları çek
      const userIds = Array.from(uniqueUsers.keys())
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds)

        const convos = profiles.map(p => ({
          ...p,
          lastMessage: uniqueUsers.get(p.id),
          unread: uniqueUsers.get(p.id)?.is_read === false && uniqueUsers.get(p.id)?.receiver_id === user.id
        }))
        setConversations(convos)

        // Eğer username param varsa, o konuşmayı aç
        if (username) {
          const selected = convos.find(c => c.username === username)
          if (selected) setSelectedUser(selected)
        }
      }
      setLoading(false)
    }

    loadConversations()
    const interval = setInterval(loadConversations, 3000)
    return () => clearInterval(interval)
  }, [user, username])

  useEffect(() => {
    if (!selectedUser || !user) return

    async function loadMessages() {
      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })

      setMessages(data || [])

      // Mark as read
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', selectedUser.id)
    }

    loadMessages()
    const interval = setInterval(loadMessages, 1000)
    return () => clearInterval(interval)
  }, [selectedUser, user])

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUser || sending) return
    setSending(true)

    await supabase.from('direct_messages').insert({
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: messageText.trim()
    })

    setMessageText('')
    setSending(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={32} className="animate-spin" /></div>
  }

  return (
    <div className="py-10 grid md:grid-cols-3 gap-6 h-[600px]">
      {/* Konuşmalar Listesi */}
      <div className="brutal-card bg-white dark:bg-dark-card p-4 overflow-y-auto space-y-2 md:col-span-1">
        <h2 className="font-heading font-bold text-lg p-2">Mesajlar</h2>
        {conversations.length === 0 ? (
          <p className="text-sm text-ink/40 dark:text-dark-muted p-2">Henüz konuşma yok</p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedUser(conv)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedUser?.id === conv.id
                  ? 'border-signal bg-paper dark:bg-dark-card2'
                  : 'border-ink/10 dark:border-dark-border hover:border-ink/30'
              }`}
            >
              <p className="font-heading font-bold text-sm text-ink dark:text-dark-text">@{conv.username}</p>
              <p className="text-xs text-ink/50 dark:text-dark-muted truncate">{conv.lastMessage?.content}</p>
              {conv.unread && <div className="badge ml-auto" />}
            </button>
          ))
        )}
      </div>

      {/* Chat Ekranı */}
      {selectedUser ? (
        <div className="brutal-card bg-white dark:bg-dark-card p-4 md:col-span-2 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 pb-4 border-b-2 border-ink/10">
            <button onClick={() => setSelectedUser(null)} className="brutal-btn px-2 py-2 md:hidden">
              <ArrowLeft size={16} />
            </button>
            <p className="font-heading font-bold text-ink dark:text-dark-text">@{selectedUser.username}</p>
          </div>

          {/* Mesajlar */}
          <div className="flex-1 overflow-y-auto space-y-3 py-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.sender_id === user.id
                      ? 'bg-signal text-white'
                      : 'bg-paper dark:bg-dark-card2 text-ink dark:text-dark-text border-2 border-ink/10'
                  }`}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-4 border-t-2 border-ink/10">
            <input
              type="text"
              className="brutal-input flex-1"
              placeholder="Mesaj yaz..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !messageText.trim()}
              className="brutal-btn btn-signal px-4 py-2"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      ) : (
        <div className="brutal-card bg-white dark:bg-dark-card md:col-span-2 flex items-center justify-center text-center">
          <p className="font-heading font-bold text-ink/40">Konuşma seç</p>
        </div>
      )}
    </div>
  )
}
