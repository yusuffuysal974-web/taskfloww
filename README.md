# TaskFlow

Trello benzeri sade ve etkili bir Kanban proje yönetim tahtası.
**Aday:** Yusuf Uysal · **Pozisyon:** Sistem Destek Uzmanı / Koç Sistem · **Tarih:** 28 Nisan 2026

## Teknoloji Yığını

- **Next.js 14** (App Router, Server Components + Server Actions)
- **dnd-kit** (sürükle-bırak, mobil + klavye desteği)
- **Supabase** (Auth + Postgres + Row Level Security)
- **Tailwind CSS**
- **TypeScript**
- **Vercel** (deploy)

---

## 🚀 Hızlı Kurulum (15 dakika)

### 1) Supabase projesi oluştur

1. [https://supabase.com](https://supabase.com) → "New project" tıkla.
2. Bir isim ver (örn. `taskflow`), şifre belirle, region: `Europe (Frankfurt)` seç.
3. Proje oluşana kadar 1-2 dakika bekle.

### 2) Veritabanı şemasını kur

1. Supabase dashboard'da sol menüden **SQL Editor** → **New query**.
2. Bu repodaki `supabase/schema.sql` dosyasının içeriğini KOPYALA-YAPIŞTIR.
3. **Run** tuşuna bas. "Success. No rows returned." mesajını görmelisin.

### 3) Supabase anahtarlarını al

1. Supabase dashboard → sol alttaki ⚙️ **Settings** → **API**.
2. İki değeri kopyala:
   - **Project URL** (örn. `https://abcdef.supabase.co`)
   - **anon public** key (uzun bir JWT)

### 4) Email confirmation'ı KAPAT (demo için)

Supabase dashboard → **Authentication** → **Providers** → **Email** → "Confirm email" toggle'ını KAPAT.
(Mülakatta hızlı demo için. Production'da açık tutulmalı.)

### 5) Yerel olarak çalıştır

```bash
# Bağımlılıkları kur
npm install

# .env.local dosyası oluştur
cp .env.local.example .env.local

# .env.local'i aç ve 3. adımdaki değerleri yapıştır:
# NEXT_PUBLIC_SUPABASE_URL=https://abcdef.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Çalıştır
npm run dev
```

http://localhost:3000 adresine git. Kayıt ol, board oluştur, kart sürükle.

---

## ☁️ Vercel'e Deploy (10 dakika)

### Yöntem A: Vercel CLI (önerilen, en hızlı)

```bash
npm i -g vercel
vercel login
vercel --prod
```

İlk deploy sırasında soracak environment variable'ları ekle:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Veya Vercel dashboard'dan **Settings → Environment Variables** üzerinden eklenebilir.

### Yöntem B: GitHub + Vercel UI

1. Bu klasörü GitHub'a push et:
   ```bash
   git init
   git add .
   git commit -m "Initial TaskFlow MVP"
   gh repo create taskflow --public --source=. --push
   ```
2. [https://vercel.com/new](https://vercel.com/new) → GitHub repo'yu içe aktar.
3. **Environment Variables** bölümüne `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` ekle.
4. **Deploy**.

Vercel sana `taskflow-yusufuysal.vercel.app` benzeri bir URL verir. Sunumdaki QR ve linki bu URL'le güncelle.

---

## 🎯 Mimari Özet

```
Frontend (Next.js 14 App Router)
    │
    ├── Server Components — board listesi, board detayı (ilk yükleme)
    ├── Client Components — KanbanBoard / KanbanColumn / KanbanCard (drag-drop)
    └── Server Actions — CRUD ve move işlemleri (lib/actions/*)
              │
              ▼
         Supabase
    ├── Auth (cookie-based, @supabase/ssr ile SSR uyumlu)
    └── Postgres + RLS (kullanıcı sadece kendi board'unu görür)
```

### Veri Modeli

- `boards` (id, owner_id, title, created_at)
- `columns` (id, board_id, title, position, created_at)
- `cards` (id, column_id, title, description, position, created_at)

`ON DELETE CASCADE` → board silinince sütun ve kartlar otomatik silinir.

### Sıralama: Float Position + Midpoint Insert

- Yeni kart sona eklenir: `position = max(position) + 1024`
- İki kart arasına insert: `position = (prev.position + next.position) / 2`
- Sayfa yenilemede: `ORDER BY position ASC` ile DB'den okunur — state kayıp yok.
- Algoritma: `src/lib/position.ts`

### Erişilebilirlik & Mobil

- **PointerSensor**: masaüstü fare + temel dokunmatik
- **TouchSensor**: 250ms uzun basma ile aktivasyon (scroll'u bozmaz)
- **KeyboardSensor**: Tab + Space + ok tuşları (ARIA live region yerleşik)

---

## 📂 Klasör Yapısı

```
taskflow/
├── supabase/schema.sql        # DB şema + RLS policies
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # / → /login veya /boards
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── boards/
│   │       ├── page.tsx       # tahta listesi
│   │       └── [id]/page.tsx  # tahta detayı (Kanban)
│   ├── components/
│   │   ├── KanbanBoard.tsx    # DndContext ana orkestratör
│   │   ├── KanbanColumn.tsx   # sortable sütun + cards SortableContext
│   │   ├── KanbanCard.tsx     # sortable kart + edit modal
│   │   └── DeleteBoardButton.tsx
│   ├── lib/
│   │   ├── supabase/{client,server,middleware}.ts
│   │   ├── actions/{auth,boards,columns,cards}.ts   # Server Actions
│   │   ├── position.ts        # midpoint algoritması
│   │   ├── types.ts
│   │   └── utils.ts
│   └── middleware.ts          # session refresh + auth guard
└── ...
```

---

## ✅ Demo Akışı (3 dakika)

1. `/signup` → e-posta + şifre → kayıt
2. Yeni board oluştur: "Sprint 12"
3. Üç sütun ekle: Yapılacaklar / Yapılıyor / Bitti
4. Birkaç kart ekle (başlık + tıklayınca açıklama düzenleme)
5. Kart sürükle-bırak ile sütunlar arasında taşı
6. Sayfayı yenile → sıralama korundu mu? **Evet.**
7. Telefonda aç (QR'ı tarat), dokunmatik sürükle-bırakı dene

---

## 🔮 Bilinçli Olarak Ertelenenler (v2)

- Etiket, son tarih, sorumlu kişi
- Board paylaşımı (sadece görüntüle vs. düzenle)
- Aktivite geçmişi
- Real-time çoklu kullanıcı (WebSocket)
- Sanal liste (büyük board'larda)
- Yorum, dosya eki, push bildirim

48 saatte yarım yapmak yerine, MVP'yi sağlam bitirip dokümante ettim.

---

## 🐞 Yaygın Hatalar

**"Failed to load schema"**: `.env.local`'deki URL/key hatalı olabilir, kontrol et.

**"User not found" / login sonrası yönlendirme yok**: Supabase'de "Confirm email" açıksa kayıt sonrası mail onayı bekler — yukarıdaki 4. adımı uygula.

**Vercel deploy fail**: Environment variable'ları "Production" ortamına eklediğinden emin ol (Preview'a değil).

**Mobilde sürükle çalışmıyor**: Tarayıcının long-press menü kapanır. 250ms basılı tutunca sürükleme başlar.
