
export async function POST(req) {
    const { prompt} = await req.json();

    const systemInstruction = `
You are a helpful, friendly AI assistant focused only on health-related topics.
If someone asks anything unrelated to health (like coding, movies, or general queries), respond with:
"❗ Please ask a health-related question."
`;

  const fullPrompt = `${systemInstruction}\nUser: ${prompt}`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }]
        })
    });

    const data = await geminiRes.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';


    return Response.json({ text: aiText });
}
