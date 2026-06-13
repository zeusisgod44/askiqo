import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { ProfileEffect } from '@/components/ProfileEffects'
import { CATEGORIES } from '@/constants'
import { Upload, Settings, Edit2, Save, X, Loader2, Camera } from 'lucide-react'

export default function Profile() {
  const { username } = useParams()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [bio, setBio] = useState('')
  const [uploading, setUploading] = useState(false)
  const [editingReply, setEditingReply] = useState(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (!profileData) {
        setLoading(false)
        return
      }
      setProfile(profileData)
      setBio(profileData.bio || '')

      const { data: messagesData } = await supabase
        .from('public_messages')
        .select('*')
        .eq('to_user_id', profileData.id)
        .eq('reply', null, { is: false })
        .order('created_at', { ascending: false })

      setMessages(messagesData || [])
      setLoading(false)
    }
    loadProfile()
  }, [username])

  const handleAvatarUpload = async (e) => {
    if (!user || !profile) return
    const file = e.target.files?.[0]
    if (!file) return

    // File boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya çok büyük (max 5MB)')
      return
    }

    setUploading(true)

    try {
      // Eski dosyayı sil
      if (profile.avatar_url) {
        const oldFileName = profile.avatar_url.split('/').pop()
        await supabase.storage
          .from('avatars')
          .remove([`${oldFileName}`])
      }

      // Yeni dosyayı yükle
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Public URL'i al
      const { data: publicUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Database'i güncelle
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl.publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile({ ...profile, avatar_url: publicUrl.publicUrl })
      alert('Fotoğraf başarıyla yüklendi!')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Yükleme başarısız: ' + error.message)
    }
    setUploading(false)
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    await supabase
      .from('profiles')
      .update({ bio })
      .eq('id', user.id)
    setProfile({ ...profile, bio })
    setShowSettings(false)
  }

  const handleReply = async (messageId) => {
    if (!replyText.trim() || !user) return
    await supabase
      .from('public_messages')
      .update({ reply: replyText, replied_at: new Date().toISOString() })
      .eq('id', messageId)

    setMessages(prev =>
      prev.map(m => m.id === messageId ? { ...m, reply: replyText } : m)
    )
    setEditingReply(null)
    setReplyText('')
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={32} className="animate-spin" />
    </div>
  )
  if (!profile) return <div className="py-20 text-center"><p className="font-heading font-bold text-2xl">Kullanıcı bulunamadı</p></div>

  const isOwner = user?.id === profile.id

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">

      {/* PROFILE HEADER */}
      <div className="brutal-card bg-lavender dark:bg-dark-card2 p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar with Effect */}
          <div className="relative group">
            <div className="avatar lg bg-butter dark:bg-dark-card relative">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="" />
                : profile.username?.[0]?.toUpperCase()
              }
              <ProfileEffect effectId={profile.active_effect} />
            </div>
            {isOwner && (
              <label
                htmlFor="avatar-input"
                className="absolute bottom-0 right-0 brutal-btn btn-signal p-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                title="Fotoğrafı değiştir"
              >
                <Camera size={16} />
              </label>
            )}
            <input
              type="file"
              id="avatar-input"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
              className="hidden"
            />
          </div>

          <div className="flex-1">
            <h1 className="font-heading font-black text-3xl tracking-tighter text-ink dark:text-dark-text">
              @{profile.username}
            </h1>
            {profile.bio && <p className="font-body text-ink/65 dark:text-dark-muted mt-1">{profile.bio}</p>}
            <div className="flex items-center gap-3 mt-2 flex-wrap text-sm">
              <span className="text-signal font-heading font-bold">💰 {profile.coins || 0} coin</span>
              <span className="text-ink/40 dark:text-dark-muted">📤 {messages.length} soru</span>
            </div>
          </div>

          {isOwner && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="brutal-btn px-4 py-2 gap-2 text-sm"
            >
              <Settings size={14} /> Düzenle
            </button>
          )}
        </div>
      </div>

      {/* SETTINGS */}
      {isOwner && showSettings && (
        <div className="brutal-card bg-white dark:bg-dark-card p-6 space-y-4">
          <h3 className="font-heading font-bold text-lg">Profili Düzenle</h3>

          <div className="space-y-2">
            <label className="font-heading font-bold text-sm">Bio</label>
            <textarea
              className="brutal-input resize-none h-16"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 100))}
              maxLength={100}
            />
            <p className="text-xs text-ink/40">{bio.length}/100</p>
          </div>

          <button onClick={handleUpdateProfile} className="brutal-btn btn-signal w-full py-2">
            <Save size={16} /> Kaydet
          </button>
        </div>
      )}

      {uploading && (
        <div className="brutal-card bg-butter dark:bg-dark-card2 p-4 flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          <p className="font-heading font-bold text-sm">Fotoğraf yükleniyor...</p>
        </div>
      )}

      {/* MESSAGES */}
      <div className="space-y-4">
        <h2 className="font-heading font-bold text-2xl">
          Cevaplanan Sorular ({messages.length})
        </h2>
        {messages.length === 0 ? (
          <div className="brutal-card bg-butter dark:bg-dark-card2 p-8 text-center">
            <p className="font-heading font-bold text-lg">Henüz cevaplanan soru yok</p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className="brutal-card bg-white dark:bg-dark-card p-6 space-y-3">
              <span className="chip text-xs">
                {CATEGORIES.find(c => c.id === m.category)?.emoji}
                {' '}
                {CATEGORIES.find(c => c.id === m.category)?.name}
              </span>
              <p className="font-heading font-bold text-lg text-ink dark:text-dark-text">{m.content}</p>

              {m.reply ? (
                <div className="p-4 rounded-xl border-2 border-ink dark:border-dark-border bg-paper dark:bg-dark-card2">
                  <p className="text-sm font-body text-ink dark:text-dark-text">{m.reply}</p>
                </div>
              ) : isOwner && editingReply !== m.id ? (
                <button
                  onClick={() => {
                    setEditingReply(m.id)
                    setReplyText('')
                  }}
                  className="brutal-btn px-3 py-1.5 text-xs gap-1"
                >
                  <Edit2 size={12} /> Cevapla
                </button>
              ) : editingReply === m.id && (
                <div className="space-y-2">
                  <textarea
                    className="brutal-input resize-none h-16"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    maxLength={300}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReply(m.id)}
                      className="brutal-btn btn-signal px-3 py-1.5 text-xs flex-1"
                    >
                      <Save size={12} /> Gönder
                    </button>
                    <button
                      onClick={() => setEditingReply(null)}
                      className="brutal-btn px-3 py-1.5 text-xs"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
