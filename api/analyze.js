export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Yalnızca POST istekleri desteklenir.' });
    }

    try {
        const { text, systemPrompt, slotId } = req.body;

        if (!text || !slotId) {
            return res.status(400).json({ error: 'Eksik veri: Metin veya Slot ID bulunamadı.' });
        }

        // Ön yüzden gelen slotId'ye göre Vercel'deki ilgili çevre değişkenini seçiyoruz
        // Örn: slotId "slot1" ise process.env.GEMINI_KEY_1 okunacak.
        const slotKeyMap = {
            'slot1': process.env.GEMINI_KEY_1,
            'slot2': process.env.GEMINI_KEY_2,
            'slot3': process.env.GEMINI_KEY_3,
            'slot4': process.env.GEMINI_KEY_4,
            'slot5': process.env.GEMINI_KEY_5,
            'slot6': process.env.GEMINI_KEY_6,
            'slot7': process.env.GEMINI_KEY_7,
            'slot8': process.env.GEMINI_KEY_8,
            'slot9': process.env.GEMINI_KEY_9,
            'slot10': process.env.GEMINI_KEY_10
        };

        const apiKey = slotKeyMap[slotId];

        // Eğer o slot için Vercel paneline henüz bir anahtar girilmemişse hata döndür
        if (!apiKey) {
            return res.status(500).json({ error: `Seçilen ${slotId.toUpperCase()} için sunucuda API anahtarı yapılandırılmamış.` });
        }

        // Gemini API isteği (Modeli esnek tutmak adına gemini-3-flash-preview kullandık)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: systemPrompt + "\n\n---\n\nAnaliz edilecek metin:\n\n" + text }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 4096,
                }
            }),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return res.status(response.status).json({
                error: errData?.error?.message || `Gemini API Hatası: ${response.status}`
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
    }
}