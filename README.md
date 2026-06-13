# soruver.app

Anonim soru-cevap uygulaması. React (Vite) + Supabase.

## Kurulum

### 1. Bağımlılıkları yükle
```bash
npm install
```

### 2. Supabase projesi oluştur
1. [supabase.com](https://supabase.com) adresine git, ücretsiz hesap aç
2. "New Project" ile yeni proje oluştur
3. `supabase_schema.sql` dosyasındaki kodu **SQL Editor**'a yapıştır ve çalıştır
4. **Project Settings → API** sayfasından şunları al:
   - `Project URL`
   - `anon / public` key

### 3. .env dosyasını oluştur
`.env.example` dosyasını kopyalayıp `.env` yap:
```bash
cp .env.example .env
```
Sonra değerleri doldur:
```
VITE_SUPABASE_URL=https://PROJE_IDIN.supabase.co
VITE_SUPABASE_ANON_KEY=buraya_anon_key_gelecek
```

### 4. Geliştirme sunucusunu başlat
```bash
npm run dev
```

Tarayıcıda `http://localhost:5173` aç.

## Proje yapısı

```
src/
├── main.jsx              # Giriş noktası
├── App.jsx               # Router + Navbar
├── index.css             # Global stiller (Tailwind + brutal-card vs)
├── lib/
│   └── supabase.js       # Supabase client
├── context/
│   └── AuthContext.jsx   # Auth state (giriş/çıkış/kayıt)
├── pages/
│   ├── Landing.jsx       # Ana sayfa
│   ├── AuthPage.jsx      # Giriş ve kayıt sayfası
│   ├── Feed.jsx          # Herkese açık cevap akışı
│   ├── Inbox.jsx         # Gelen sorular (sadece giriş yapan)
│   └── Profile.jsx       # /u/:username profil sayfası
└── components/
    └── QuestionCard.jsx  # Tekrar eden soru kartı
```

## Deploy (Vercel)
```bash
npm run build
```
Vercel'e push et, env değişkenlerini Vercel Dashboard'dan ekle.
