export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // URL Web App Google Apps Script Baru Anda
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzSkR7X9mdGa8XEQ_QEw8nx9Q3ml-oDcXedaObilNOIjDPRKtf3w19pboeGyHfgcb9-/exec"; 

    if (req.method === 'POST') {
        try {
            const { action = "submit-score", finalScore, details, key, value, userId } = req.body || {};
            
            // Mengirimkan data ke Google Apps Script
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: action, 
                    finalScore: Number(finalScore) || 0,
                    details: details || {},
                    key: key,
                    value: Number(value) || 0,
                    userId: userId || "user_default"
                })
            });

            const textResult = await response.text();
            if (textResult.startsWith("<!DOCTYPE") || textResult.startsWith("<html")) {
                throw new Error("Google Apps Script mengembalikan HTML. Pastikan Deployment diatur ke 'Anyone'.");
            }

            const jsonResult = JSON.parse(textResult);
            return res.status(200).json(jsonResult);
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    } else if (req.method === 'GET') {
        try {
            const userId = req.query.userId || "user_default";
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?userId=${encodeURIComponent(userId)}`);
            const textResult = await response.text();
            
            if (textResult.startsWith("<!DOCTYPE") || textResult.startsWith("<html")) {
                return res.status(200).json({ scoreB6: 0, streak: 0, history: [], details: {} });
            }
            
            const data = JSON.parse(textResult);
            return res.status(200).json(data);
        } catch (err) {
            return res.status(200).json({ scoreB6: 0, streak: 0, history: [], details: {}, error: err.message });
        }
    } else {
        return res.status(405).json({ error: 'Metode tidak diizinkan.' });
    }
}
