import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Heart } from 'lucide-react'

export default function QuestionCard({ question }) {
  const [likes, setLikes] = useState(question.likes || 0)
  const [liked, setLiked] = useState(false)

  const handleLike = async () => {
    if (liked) return
    setLiked(true)
    setLikes((l) => l + 1)
    await supabase
      .from('messages')
      .update({ likes: likes + 1 })
      .eq('id', question.id)
  }

  return (
    <div className="brutal-card bg-white dark:bg-dark-card p-6 space-y-3">
      <div className="space-y-3">
        <span className="chip text-xs">anonim</span>
        <p className="font-heading font-bold text-lg text-ink dark:text-dark-text">{question.content}</p>
        {question.reply && (
          <div className="p-4 rounded-xl border-2 border-ink dark:border-dark-border bg-paper dark:bg-dark-card2 font-body text-ink/85 dark:text-dark-text">
            {question.reply}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        {question.profiles?.username && (
          <Link
            to={`/u/${question.profiles.username}`}
            className="text-sm font-heading font-bold text-ink/40 dark:text-dark-muted hover:text-signal transition-colors"
          >
            @{question.profiles.username}
          </Link>
        )}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-heading font-bold transition-colors ml-auto ${
            liked ? 'text-signal' : 'text-ink/40 dark:text-dark-muted hover:text-signal'
          }`}
        >
          <Heart size={16} strokeWidth={2.5} fill={liked ? 'currentColor' : 'none'} />
          {likes}
        </button>
      </div>
    </div>
  )
}
