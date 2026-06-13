import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Loader2, Send, X, Save } from 'lucide-react'

export default function Inbox() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyMap, setReplyMap] = useState({})

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data } = await supabase
        .from('public_messages')
        .select('*')
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false })
      setMessages(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const handleReply = async (msgId) => {
    const reply = replyMap[msgId]
    if (!reply?.trim()) return

    await supabase
      .from('public_messages')
      .update({ reply, replied_at: new Date().toISOString() })
      .eq('id', msgId)

    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reply } : m))
    setReplyMap(prev => ({ ...prev, [msgId]: '' }))
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={32} className="animate-spin" /></div>

  const unanswered = messages.filter(m => !m.reply)
  const answered = messages.filter(m => m.reply)

  return (
    <div className="py-10 space-y-8">
      <span className="chip">gelen kutusu</span>
      <h1 className="font-heading font-black text-4xl">Mesajlarım</h1>
      <p className="text-ink/50 dark:text-dark-muted">{unanswered.length} cevaplanmamış</p>

      {messages.length === 0 ? (
        <div className="brutal-card bg-lavender dark:bg-dark-card2 p-10 text-center">
          <p className="font-heading font-bold text-lg">Henüz mesaj yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cevaplanmamışlar */}
          {unanswered.map((m) => (
            <div key={m.id} className="brutal-card bg-white dark:bg-dark-card p-6 space-y-3">
              <span className="chip text-xs">anonim</span>
              <p className="font-heading font-bold text-lg">{m.content}</p>
              <textarea
                className="brutal-input resize-none h-16"
                placeholder="Cevabını yaz..."
                value={replyMap[m.id] || ''}
                onChange={(e) => setReplyMap(prev => ({ ...prev, [m.id]: e.target.value }))}
                maxLength={300}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => handleReply(m.id)}
                  className="brutal-btn btn-signal px-4 py-2 gap-2 text-sm"
                  disabled={!replyMap[m.id]?.trim()}
                >
                  <Send size={14} /> Gönder
                </button>
              </div>
            </div>
          ))}

          {/* Cevaplanmışlar */}
          {answered.length > 0 && (
            <div className="mt-8 pt-8 border-t-2 border-ink/10">
              <h3 className="font-heading font-bold text-xl mb-4">Cevapladıklarım ({answered.length})</h3>
              <div className="space-y-4">
                {answered.map((m) => (
                  <div key={m.id} className="brutal-card bg-mint dark:bg-dark-card2 p-6">
                    <p className="font-heading font-bold text-lg mb-2">{m.content}</p>
                    <div className="p-3 bg-white dark:bg-dark-card rounded-lg border-2 border-ink/10">
                      <p className="font-body text-sm">{m.reply}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
