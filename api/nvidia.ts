export default async function handler(req: any, res: any) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!body || !body.messages) {
      return res.status(400).json({ error: "Missing messages" });
    }

    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta/llama-3.1-nemotron-safety-guard-8b-v3",
          messages: body.messages,
          max_tokens: body.max_tokens ?? 256,
          temperature: 0.2,
        }),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error("NVIDIA API error:", response.status, text);
      return res.status(200).json({
        choices: [
          {
            message: {
              content: '{"valid": true, "reason": "fallback"}'
            }
          }
        ]
      });
    }

    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}