import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Check, Lock } from 'lucide-react'

const THEMES = [
  {
    id: 'default',
    name: 'Varsayılan',
    description: 'Standart brutalist tasarım',
    price: 0,
    colors: { bg: '#fafaf7', accent: '#ff3b00' }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon renkler ve glow efekti',
    price: 50,
    colors: { bg: '#0a0a0a', accent: '#00ff41' }
  },
  {
    id: 'ocean',
    name: 'Ocean Wave',
    description: 'Mavi tonlar, rahatlama teması',
    price: 50,
    colors: { bg: '#e6f3ff', accent: '#0066cc' }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Turuncu-pembe degradesi',
    price: 50,
    colors: { bg: '#fff5e6', accent: '#ff6b35' }
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Yeşil ve doğa teması',
    price: 50,
    colors: { bg: '#f0fdf4', accent: '#15803d' }
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Derin koyu mor',
    price: 50,
    colors: { bg: '#2d1b4e', accent: '#c084fc' }
  },
]

export default function Shop() {
  const { user } = useAuth()
  const [owned, setOwned] = useState(['default'])
  const [coins, setCoins] = useState(500)
  const [selectedTheme, setSelectedTheme] = useState('default')

  const handleBuyTheme = (theme) => {
    if (coins >= theme.price) {
      setCoins(coins - theme.price)
      setOwned([...owned, theme.id])
    }
  }

  return (
    <div className="py-10 space-y-8">
      <div>
        <span className="chip">shop</span>
        <h1 className="font-heading font-black text-4xl mt-2">Tema Mağazası</h1>
      </div>

      {/* Coin Balance */}
      <div className="brutal-card bg-signal text-white p-6">
        <p className="text-sm opacity-90">Senin Coinlerin</p>
        <p className="font-heading font-black text-4xl">💰 {coins}</p>
        <p className="text-sm opacity-75 mt-1">Her ay +100 coin kazanırsın</p>
      </div>

      {/* Themes Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {THEMES.map((theme) => {
          const isOwned = owned.includes(theme.id)
          const isSelected = selectedTheme === theme.id

          return (
            <div
              key={theme.id}
              className={`brutal-card p-6 cursor-pointer transition-all ${
                isSelected
                  ? 'border-signal scale-105'
                  : 'border-ink/20'
              }`}
              onClick={() => isOwned && setSelectedTheme(theme.id)}
              style={{
                backgroundColor: theme.colors.bg,
                borderColor: isSelected ? '#ff3b00' : undefined
              }}
            >
              {/* Color Preview */}
              <div className="h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: theme.colors.accent }}>
                <span className="text-white font-heading font-bold">●</span>
              </div>

              <h3 className="font-heading font-bold text-lg">{theme.name}</h3>
              <p className="font-body text-sm text-ink/60 mt-1">{theme.description}</p>

              {/* Status */}
              <div className="mt-4 pt-4 border-t-2 border-ink/10">
                {isOwned ? (
                  <div className="flex items-center gap-2 text-signal font-heading font-bold">
                    <Check size={16} />
                    {isSelected ? 'Seçili' : 'Sahibi'}
                  </div>
                ) : theme.price === 0 ? (
                  <p className="font-heading font-bold text-signal">Ücretsiz</p>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBuyTheme(theme)
                    }}
                    disabled={coins < theme.price}
                    className="brutal-btn btn-signal w-full py-2 gap-1 text-sm disabled:opacity-50"
                  >
                    {coins < theme.price ? (
                      <><Lock size={14} /> {theme.price} Coin</>
                    ) : (
                      <> Satın Al {theme.price} 💰</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Info */}
      <div className="brutal-card bg-lavender dark:bg-dark-card2 p-6">
        <h3 className="font-heading font-bold text-lg mb-2">💡 Tema Kazanma</h3>
        <ul className="font-body text-sm space-y-1">
          <li>✓ Her mesaj atılışta +50 puan</li>
          <li>✓ Her beğeni alışta +10 puan</li>
          <li>✓ 100 puan = 10 coin</li>
          <li>✓ Ay başında bonus +100 coin</li>
        </ul>
      </div>
    </div>
  )
}
