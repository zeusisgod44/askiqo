export const CATEGORIES = [
  { id: 'game', name: 'Oyun', emoji: '🎮' },
  { id: 'music', name: 'Müzik', emoji: '🎵' },
  { id: 'film', name: 'Film', emoji: '🎬' },
  { id: 'series', name: 'Dizi', emoji: '📺' },
  { id: 'sports', name: 'Spor', emoji: '⚽' },
]

export const PROFILE_EFFECTS = [
  {
    id: 'none',
    name: 'Yok',
    price: 0,
    description: 'Efekt yok',
    type: 'none'
  },
  {
    id: 'particles',
    name: 'Parçacıklar',
    price: 100,
    description: 'Parlayan parçacık efekti',
    type: 'particles'
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    price: 150,
    description: 'Kuzey ışığı animasyonu',
    type: 'aurora'
  },
  {
    id: 'fire',
    name: 'Ateş',
    price: 120,
    description: 'Alevlenme efekti',
    type: 'fire'
  },
  {
    id: 'magic',
    name: 'Sihir',
    price: 180,
    description: 'Sihirli parıltı',
    type: 'magic'
  },
  {
    id: 'waves',
    name: 'Dalgalar',
    price: 140,
    description: 'Su dalgası efekti',
    type: 'waves'
  },
  {
    id: 'void',
    name: 'Boşluk',
    price: 200,
    description: 'Kozmik boşluk',
    type: 'void'
  }
]

export const THEMES = [
  {
    id: 'default',
    name: 'Varsayılan',
    price: 0,
    colors: { bg: '#fafaf7', accent: '#ff3b00' }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    price: 50,
    colors: { bg: '#0a0a0a', accent: '#00ff41' }
  },
]
