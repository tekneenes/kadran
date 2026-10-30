# Kadran ⏱️
### Retro Flip-Clock Timer, Live Financial Ticker & Ambient Focus Dashboard

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Motion](https://img.shields.io/badge/Framer_Motion-12.2-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://motion.dev/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge)](LICENSE)

> **Mekanik 3D flip-clock animasyonları, canlı döviz & altın piyasaları, dinamik Türkiye hava durumu ve akışkan RSS haber şeridiyle donatılmış modern odaklanma ve ortam panosu.**

---

## 🌟 Öne Çıkan Özellikler

### 1. 🕰️ Mekanik 3D Retro Flip-Clock Zamanlayıcısı
- Gerçekçi 3 boyutlu yaprak düşüşü (flip digit animation) ve mekanik tik-tak ses efektleri.
- **Çalışma Modları:** Pomodoro, Geri Sayım (Countdown) ve Kronometre (Stopwatch).
- Özelleştirilebilir son 5/10 saniye uyarı sinyali (warning beep) ve bitiş alarmları (*Classic & Cool*).

### 2. 📈 Canlı Piyasa & Finansal Göstergeler (`MarketWidget`)
- Anlık döviz kuru takibi: **USD / TRY**, **EUR / TRY**.
- Canlı kıymetli maden ve endeksler: **Gram Altın**, **Çeyrek Altın** ve **BIST 100**.
- Değişim yüzdeleri, anlık yeşil/kırmızı yön göstergeleri ve otomatik periyodik yenileme.

### 3. 🌦️ Konum Bazlı Türkiye Hava Durumu (`WeatherWidget`)
- Tarayıcı coğrafi konumu (Geolocation) ile otomatik il ve ilçe tespiti.
- Gerçek zamanlı sıcaklık, hissedilen sıcaklık, rüzgar hızı ve hava durumu ikonları.

### 4. 📰 Akıcı Canlı Haber Şeridi (`NewsTicker`)
- Türkiye ve dünya gündeminden son dakika haberlerini derleyen RSS besleme motoru.
- Kesintisiz yatay kayma (marquee), hover ile duraklatma ve doğrudan kaynağa yönlendirme.

### 5. 🎧 Ortam Sesleri & Akıllı Karartma (Focus Ambient)
- Odaklanmayı artıran dahili **Yağmur Sesi (Rain)** ve **Beyaz Gürültü (White Noise)** jeneratörü.
- Fare hareketsiz kaldığında ekranı dinlendirici minimalist moda geçiren akıllı enerji tasarrufu.

### 6. 📱 Android TV & Daydream Ekran Koruyucusu Uyumluluğu
Kadran web çekirdeği, **[kadran-timer](https://github.com/tekneenes/kadran-timer)** projesi aracılığıyla Android TV ve tabletlerde yerel bir Daydream (Ekran Koruyucu) olarak çevrimdışı çalıştırılabilir.

---

## 📂 Proje Dizin Yapısı

```
kadran/
├── src/
│   ├── components/
│   │   ├── FlipDigit.tsx         # 3D mekanik yaprak çevirme animasyon bileşeni
│   │   ├── Timer.tsx             # Ana saat, pomodoro ve süre sayacı kontrolcüsü
│   │   ├── MarketWidget.tsx      # Canlı döviz, altın ve borsa bilgi kartı
│   │   ├── WeatherWidget.tsx     # Konum duyarlı dinamik hava durumu
│   │   ├── NewsTicker.tsx        # RSS akışlı kesintisiz alt haber bandı
│   │   └── SettingsDialog.tsx    # Ses, alarm, süre ve görünüm ayar modali
│   ├── services/
│   │   └── rssService.ts         # Haber kaynaklarını çeken ve parse eden servis
│   ├── types.ts                  # TypeScript tip tanımları
│   ├── App.tsx                   # Ana uygulama çatısı ve durum yönetimi
│   └── main.tsx                  # React 19 kök başlatıcı
├── index.html                    # HTML giriş şablonu
├── metadata.json                 # PWA & AI Studio meta yapılandırması
├── package.json                  # Bağımlılıklar ve derleme betikleri
└── vite.config.ts                # Vite 6 + Tailwind v4 yapılandırması
```

---

## 🚀 Başlangıç ve Yerel Geliştirme

### Gereksinimler
- **Node.js:** v18.0.0 veya üzeri
- **npm** veya **pnpm / yarn**

### Adım Adım Kurulum

```bash
# Repoyu klonlayın
git clone https://github.com/tekneenes/kadran.git
cd kadran

# Bağımlılıkları yükleyin
npm install

# İsteğe bağlı: .env.local dosyasını yapılandırın
cp .env.example .env.local

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızdan **`http://localhost:3000`** adresine giderek uygulamayı görüntüleyebilirsiniz.

### Canlıya Derleme (Production Build)

```bash
npm run build
```
Derlenen dosyalar `dist/` klasörüne aktarılır ve doğrudan herhangi bir statik sunucuya (Vercel, Netlify, GitHub Pages, Firebase Hosting) yüklenebilir.

---

## 📺 Android TV Ekran Koruyucusu (Daydream)

Bu web uygulamasını Android TV'nizde televizyon ekran koruyucusu olarak kullanmak için yerel Android projesine göz atın:  
👉 **[tekneenes/kadran-timer](https://github.com/tekneenes/kadran-timer)**

---

## 📜 Lisans & Atıflar

Bu proje **[Apache License 2.0](LICENSE)** altında lisanslanmıştır.  
Kullanılan üçüncü taraf açık kaynak kütüphaneler ve atıflar **[NOTICE](NOTICE)** dosyasında belirtilmiştir.

---

## 👨‍💻 Geliştirici

**Muhammed Enes Tekne**  
- **GitHub:** [@tekneenes](https://github.com/tekneenes)  
- **Portfolyo:** [tekneenes.github.io](https://tekneenes.github.io)
