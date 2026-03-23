// api/wycena.js
// Vercel Serverless Function — klucz API jest TYLKO tutaj, nigdy w przeglądarce

export default async function handler(req, res) {

  // ── Tylko POST ──
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Tylko metoda POST jest dozwolona.' });
  }

  // ── Odczyt danych z requestu ──
  const { name, category, year, condition, description } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Podaj nazwę przedmiotu.' });
  }

  // ── Klucz API pobierany ze zmiennej środowiskowej Vercel ──
  // NIE wpisuj klucza tutaj na sztywno — ustaw go w panelu Vercel
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Brak konfiguracji serwera. Skontaktuj się z adminem.' });
  }

  // ── Prompt dla Claude ──
  const prompt = `Jesteś ekspertem od wyceny używanych przedmiotów na polskim rynku (OLX, Vinted, Allegro, Facebook Marketplace).

Wycen poniższy przedmiot i zwróć WYŁĄCZNIE JSON (bez żadnego tekstu przed ani po, bez markdown):

Przedmiot: ${name}
Kategoria: ${category || 'Nieznana'}
Rok zakupu: ${year || 'Nieznany'}
Stan: ${condition || 'Używany'}
Opis: ${description || 'Brak'}

Odpowiedz TYLKO tym JSON-em:
{
  "optimalPrice": "XXX zł",
  "priceMin": "XXX zł",
  "priceMax": "XXX zł",
  "sellChance": 75,
  "depreciation": "XX%",
  "daysToSell": "X-Y dni",
  "demand": "Wysoki/Średni/Niski",
  "tips": [
    {"icon": "✅", "type": "green", "text": "<strong>Tytuł:</strong> opis wskazówki"},
    {"icon": "⚡", "type": "amber", "text": "<strong>Tytuł:</strong> opis wskazówki"},
    {"icon": "📸", "type": "green", "text": "<strong>Tytuł:</strong> opis wskazówki"}
  ],
  "platforms": [
    {"name": "OLX", "emoji": "🟠", "bg": "#FF6600", "color": "#fff", "price": "XXX zł", "sub": "Największy zasięg"},
    {"name": "Vinted", "emoji": "🟢", "bg": "#1DC99A", "color": "#fff", "price": "XXX zł", "sub": "Dla odzieży i akcesoriów"},
    {"name": "Allegro", "emoji": "🔴", "bg": "#FF5A00", "color": "#fff", "price": "XXX zł", "sub": "Aukcje — wyższe ceny"}
  ]
}

Podaj realistyczne polskie ceny w złotych. sellChance to liczba 0-100.`;

  try {
    // ── Wywołanie Anthropic API ──
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      console.error('Anthropic error:', errText);
      return res.status(502).json({ error: 'Błąd połączenia z AI. Spróbuj ponownie.' });
    }

    const anthropicData = await anthropicResponse.json();
    const rawText = anthropicData.content?.map(b => b.text || '').join('') || '';

    // ── Wyodrębnij JSON z odpowiedzi ──
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Brak JSON w odpowiedzi:', rawText);
      return res.status(502).json({ error: 'Nieprawidłowa odpowiedź AI.' });
    }

    const result = JSON.parse(jsonMatch[0]);

    // ── Zwróć wynik do przeglądarki ──
    return res.status(200).json(result);

  } catch (err) {
    console.error('Błąd serwera:', err);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera.' });
  }
}
