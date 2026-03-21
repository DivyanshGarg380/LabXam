export default async function handler(req: any, res: any) {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;

  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(req.body),
  });

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
          max_tokens: 256,
          temperature: 0.2,
        }),
      }
    );

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
}