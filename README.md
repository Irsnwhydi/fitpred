# FitPred — Prediksi Pola Makan & Diet

Capstone Project | Tema: Healthy Lives & Well-being

---

## Deskripsi

FitPred adalah platform prediksi pola makan berbasis AI yang menganalisis data kesehatan pengguna untuk memberikan rekomendasi diet personal. Model AI di-deploy oleh tim AI Engineer di Railway.

**API AI Engineer:** https://model-api-production-9ded.up.railway.app/docs

---

## Struktur Project

```
fitpred/
├── frontend/                  React via CDN (HTML/CSS/JS)
│   ├── index.html
│   └── src/
│       ├── styles/
│       ├── services/api.js
│       ├── context/AuthContext.js
│       ├── components/
│       └── pages/
└── backend/                   Node.js + Express + PostgreSQL
    ├── server.js
    ├── .env.example
    ├── config/
    │   ├── database.js
    │   ├── schema.sql
    │   └── modelLoader.js    Koneksi ke Railway AI API
    ├── controllers/
    ├── middleware/
    └── routes/
```

---

## Prasyarat

Pastikan sudah terinstall sebelum mulai:

| Software    | Versi       | Download                                  |
|-------------|-------------|-------------------------------------------|
| Node.js     | v20 LTS     | https://nodejs.org                        |
| PostgreSQL  | 13+         | https://www.postgresql.org/download       |

Cek via terminal:
```
node -v        -> harus v20.x.x
psql --version -> harus PostgreSQL 13+
```

---

## Cara Menjalankan

### LANGKAH 1 — Setup Database (sekali saja)

**Buat database:**

Via pgAdmin:
1. Buka pgAdmin > Login
2. Klik kanan Databases > Create > Database
3. Nama: `fitpred_db` > Save

Via CMD/Terminal:
```bash
psql -U postgres -c "CREATE DATABASE fitpred_db;"
```

**Jalankan schema (buat tabel):**

Via pgAdmin:
1. Klik kanan `fitpred_db` > Query Tool
2. Buka file `backend/config/schema.sql`
3. Tekan F5 atau klik Run

Via CMD:
```bash
psql -U postgres -d fitpred_db -f backend/config/schema.sql
```

Berhasil jika muncul: `Query returned successfully`

---

### LANGKAH 2 — Setup & Jalankan Backend (Terminal 1)

```bash
cd fitpred/backend
```

Buat file `.env`:
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit file `.env`, wajib isi `DB_PASSWORD`:
```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fitpred_db
DB_USER=postgres
DB_PASSWORD=ISI_PASSWORD_POSTGRES_ANDA

JWT_SECRET=fitpred_rahasia_jwt_2024
JWT_EXPIRES_IN=7d

AI_API_URL=https://model-api-production-9ded.up.railway.app
AI_API_KEY=

FRONTEND_URL=http://localhost:3000
```

Install dependencies dan jalankan:
```bash
npm install
npm run dev
```

Berhasil jika terminal menampilkan:
```
FitPred Backend running on port 5000
PostgreSQL connected — fitpred_db
```

Cek di browser:
- http://localhost:5000/api/health-check  -> `{"success":true,"database":"connected"}`
- http://localhost:5000/api/ai-status     -> `{"success":true,"ai_service":{"status":"ok"}}`

---

### LANGKAH 3 — Jalankan Frontend (Terminal 2)

```bash
cd fitpred/frontend
```

Install live-server (sekali saja):
```bash
npm install -g live-server
```

Jalankan:
```bash
live-server --port=3000
```

Browser otomatis terbuka ke: http://localhost:3000

Alternatif via VS Code: install extension "Live Server", klik kanan `index.html` > Open with Live Server.

---

## Ringkasan Terminal

```
Terminal 1  ->  npm run dev          (Backend  - port 5000)
Terminal 2  ->  live-server          (Frontend - port 3000)
Database    ->  Setup sekali, tidak perlu dijalankan ulang
```

---

## URL Lengkap

| Service         | URL                                                      |
|-----------------|----------------------------------------------------------|
| Aplikasi        | http://localhost:3000                                    |
| Backend API     | http://localhost:5000/api/health-check                   |
| Status AI       | http://localhost:5000/api/ai-status                      |
| AI API (Railway)| https://model-api-production-9ded.up.railway.app/docs   |

---

## Troubleshooting

| Error                              | Penyebab                    | Solusi                                         |
|------------------------------------|-----------------------------|------------------------------------------------|
| Cannot connect to database         | Password salah / PG mati    | Cek DB_PASSWORD di .env, start PostgreSQL      |
| Route tidak ditemukan              | Backend belum jalan         | Jalankan `npm install` lalu `npm run dev`      |
| Prediksi gagal                     | AI API Railway bermasalah   | Cek http://localhost:5000/api/ai-status        |
| EADDRINUSE port 5000               | Port sudah dipakai          | Ganti PORT=5001 di .env                        |
| npm install error                  | Node versi salah            | Gunakan Node.js v20 (via NVM)                  |

---

## 35 Fitur Input Model AI

Age, Height_cm, Weight_kg, Blood_Pressure_Systolic, Blood_Pressure_Diastolic,
Cholesterol_Level, Blood_Sugar_Level, Daily_Steps, Exercise_Frequency, Sleep_Hours,
Caloric_Intake, Protein_Intake, Carbohydrate_Intake, Fat_Intake,
Gender_Male, Gender_Other, Chronic_Disease_Heart Disease, Chronic_Disease_Hypertension,
Chronic_Disease_No Chronic Disease, Chronic_Disease_Obesity, Genetic_Risk_Factor_Yes,
Allergies_Lactose Intolerance, Allergies_No Allergies, Allergies_Nut Allergy,
Alcohol_Consumption_Yes, Smoking_Habit_Yes, Dietary_Habits_Regular, Dietary_Habits_Vegan,
Dietary_Habits_Vegetarian, Preferred_Cuisine_Indian, Preferred_Cuisine_Mediterranean,
Preferred_Cuisine_Western, Food_Aversions_Salty, Food_Aversions_Spicy, Food_Aversions_Sweet

