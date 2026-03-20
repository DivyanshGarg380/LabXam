export default async function handler(req: any, res: any) {
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.status(200).json(data);
}