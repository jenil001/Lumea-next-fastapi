import { Groq } from 'groq-sdk';

export async function POST(request) {
  try {
    const { entries, themeId } = await request.json();

    if (!entries || entries.length === 0) {
      return Response.json({ insight: "No mood data yet. Start tracking to see your patterns unfold." });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ insight: "AI insights unavailable — API key not configured." });
    }

    const moodLabels = { 1: 'Calm', 2: 'Joyful', 3: 'Anxious', 4: 'Sad' };

    const summary = entries.slice(0, 7).map(e => {
      const label = moodLabels[e.mood] || 'Unknown';
      const date = new Date(e.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      return `${date}: ${label}${e.note ? ` — "${e.note}"` : ''}`;
    }).join('\n');

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: 'system',
          content: `You are Lumea, a compassionate AI journaling companion. 
Analyze the user's recent mood entries and provide a warm, poetic, 1-2 sentence insight about their emotional patterns. 
Be encouraging and specific about what you notice. 
${themeId === 'night-sky' ? 'Use gentle celestial and star-themed metaphors.' : 'Use human-centric, grounded metaphors about growth, flow, and inner peace. Avoid celestial/star references.'}
Never diagnose or give clinical advice. Keep it to 30 words max.`
        },
        {
          role: 'user',
          content: `Here are my recent mood entries:\n${summary}\n\nGive me a short insight.`
        }
      ],
      temperature: 0.75,
      max_tokens: 80,
    });

    const insight = completion.choices[0]?.message?.content || "Your constellations are forming beautifully.";
    return Response.json({ insight });

  } catch (err) {
    console.error("Mood insight error:", err);
    const fallback = themeId === 'night-sky' ? "Your stars are aligning." : "Your emotional journey is unfolding beautifully.";
    return Response.json({ insight: `${fallback} Keep tracking to reveal the patterns.` });
  }
}
