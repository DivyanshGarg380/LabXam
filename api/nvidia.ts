export default async function handler(req: any, res: any) {
  try {
    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta/llama3-70b-instruct",
          messages: req.body.messages,
          max_tokens: req.body.max_tokens ?? 256,
          temperature: 0.2,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("NVIDIA API error:", response.status, text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}