import { Groq } from 'groq-sdk'

export async function POST(request) {
  try {
    const { thought_text } = await request.json();

    if (!thought_text || typeof thought_text !== 'string') {
      return new Response(
        JSON.stringify({ 
          status: "error",
          error: { code: "BAD_REQUEST", message: "Missing or invalid 'thought_text' string in payload." }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          status: "error",
          error: { code: "SERVER_CONFIG_ERROR", message: "Groq API key is not configured on server." }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const groq = new Groq({ apiKey });

    const systemPrompt = 
      "You are Lumea, an empathetic AI mental health companion trained in automated CBT (Cognitive Behavioral Therapy). " +
      "Analyze the thought below to identify if it matches a common Cognitive Distortion.\n\n" +
      "Common Distortions:\n" +
      "- Catastrophizing: Assuming the worst-case scenario.\n" +
      "- All-or-Nothing Thinking: Seeing things in black and white lists.\n" +
      "- Mind Reading: Assuming you know what others are thinking.\n" +
      "- Fortune Telling: Predicting a negative future outcome.\n" +
      "- Should Statements: Rigid demands ('I should/must be').\n" +
      "- Labeling: Attaching global negative terms to yourself.\n\n" +
      "Respond in JSON format with EXACTLY these keys:\n" +
      "{\n" +
      '  "distortion": "Name of distortion",\n' +
      '  "description": "1-sentence warm explanation of why this thought matches.",\n' +
      '  "reframe_prompt": "1-sentence supportive question guiding the user to challenge it."\n' +
      "}";

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Automatic Thought: "${thought_text}"` }
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from AI engine.");
    }

    return new Response(content, {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("CBT API Error:", error);
    return new Response(
      JSON.stringify({ 
        status: "error",
        error: { code: "CBT_ANALYSIS_FAILED", message: "CBT analysis execution failed: " + error.message }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
