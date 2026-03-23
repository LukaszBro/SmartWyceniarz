# ZmianaWartości 🏷️
> AI wycena używanych rzeczy na polski rynek (OLX, Vinted, Allegro)

## Struktura projektu

```
zmiana-wartosci/
├── api/
│   └── wycena.js        ← Vercel Function (tu jest klucz API — bezpieczny!)
├── public/
│   └── index.html       ← Cała aplikacja frontendowa
├── vercel.json          ← Konfiguracja Vercel
├── package.json
└── .gitignore
```

---

## Jak wdrożyć krok po kroku

### 1. Utwórz konto GitHub
1. Wejdź na https://github.com → Sign up
2. Potwierdź e-mail

### 2. Wgraj projekt na GitHub
1. Na GitHub kliknij "+" → "New repository"
2. Nazwa: `zmiana-wartosci`, ustaw jako **Private**
3. Kliknij "Create repository"
4. Na swoim komputerze zainstaluj Git: https://git-scm.com
5. Otwórz terminal w folderze projektu i wpisz:

```bash
git init
git add .
git commit -m "pierwsza wersja"
git remote add origin https://github.com/TWOJ_LOGIN/zmiana-wartosci.git
git push -u origin main
```

### 3. Podłącz Vercel
1. Wejdź na https://vercel.com → Sign up with GitHub
2. Kliknij "Add New Project"
3. Wybierz repozytorium `zmiana-wartosci`
4. Kliknij "Deploy" — Vercel automatycznie wykryje konfigurację

### 4. Dodaj klucz API (NAJWAŻNIEJSZY KROK)
1. Wejdź na https://console.anthropic.com → API Keys → Create Key
2. Skopiuj klucz (zaczyna się od `sk-ant-...`)
3. W panelu Vercel wejdź w: Project → Settings → Environment Variables
4. Dodaj zmienną:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-TWÓJ-KLUCZ`
   - **Environment:** Production, Preview, Development (zaznacz wszystkie)
5. Kliknij Save
6. Przejdź do Deployments → kliknij "Redeploy" (żeby załadować nową zmienną)

### 5. Gotowe! 🎉
Twoja aplikacja działa pod adresem: `https://zmiana-wartosci.vercel.app`

---

## Jak działa bezpieczeństwo

```
Użytkownik (przeglądarka)
        │
        │  POST /api/wycena
        │  { name, category, year, condition }
        ▼
Vercel Function (serwer)
        │
        │  Tutaj jest ANTHROPIC_API_KEY
        │  — użytkownik nigdy go nie widzi
        │
        │  POST https://api.anthropic.com/v1/messages
        ▼
Claude API (Anthropic)
        │
        │  Odpowiedź JSON z wyceną
        ▼
Vercel Function → zwraca wynik do przeglądarki
```

---

## Lokalne testowanie

```bash
npm install
npx vercel dev
```
Następnie wejdź na http://localhost:3000

Plik `.env` do lokalnego testowania (NIE wgrywaj na GitHub!):
```
ANTHROPIC_API_KEY=sk-ant-TWÓJ-KLUCZ
```

---

## Koszty

| Usługa | Koszt |
|--------|-------|
| Vercel hosting | **Darmowy** (do 100GB transfer/mies.) |
| Vercel Functions | **Darmowe** (do 100k wywołań/mies.) |
| Claude API (1 wycena) | ~0,003 zł |
| Claude API (1000 wycen) | ~3 zł |

Przy 500 użytkownikach Premium × 9,99 zł = **~4 995 zł/mies.** przychodu
