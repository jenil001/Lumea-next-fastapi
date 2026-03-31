export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ 
          status: "error",
          error: { code: "BAD_REQUEST", message: "Missing or invalid 'text' string in payload." }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const hfToken = process.env.HF_TOKEN
    if (!hfToken) {
      return new Response(
        JSON.stringify({ 
          status: "error",
          error: { code: "SERVER_CONFIG_ERROR", message: "Hugging Face token is not configured on server." }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const HF_API_URL = "https://router.huggingface.co/hf-inference/models/j-hartmann/emotion-english-distilroberta-base"

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: text })
    })

    const EMOTION_MAP = {
      "joy": "😊 Joy",
      "sadness": "😢 Sadness",
      "anger": "😠 Anger",
      "fear": "😨 Fear",
      "surprise": "😲 Surprise",
      "disgust": "🤢 Disgust",
      "neutral": "😐 Neutral"
    }

    if (response.status === 200) {
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        // The API returns an array of label objects
        const predictions = data[0]
        const topPred = predictions.reduce((prev, current) => 
          (prev.score > current.score) ? prev : current
        )
        const label = topPred.label.toLowerCase()
        const score = topPred.score

        const mappedLabel = EMOTION_MAP[label] || label.charAt(0).toUpperCase() + label.slice(1)
        return new Response(
          JSON.stringify({ emotion: mappedLabel, score: Math.round(score * 100 * 10) / 10 }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      }
    } else if (response.status === 503) {
      return new Response(
        JSON.stringify({ status: "loading", message: "⏳ Loading Hugging Face Model..." }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        status: "error",
        error: { code: "UPSTREAM_API_ERROR", message: `Hugging Face API returned error status: ${response.status}` }
      }),
      { status: response.status, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("HF Emotion API Error:", error)
    return new Response(
      JSON.stringify({ 
        status: "error",
        error: { code: "EMOTION_ANALYSIS_FAILED", message: "Failed to connect to Emotion engine: " + error.message }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
