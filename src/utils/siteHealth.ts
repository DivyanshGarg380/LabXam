type ServiceStatus = {
  name: string;
  status: "UP" | "DOWN";
  responseTime?: number;
};

// ✅ This function was missing — restore it
async function checkEndpoint(url: string): Promise<ServiceStatus> {
  const start = performance.now();

  try {
    const res = await fetch(url, { method: "HEAD" });
    const end = performance.now();

    return {
      name: url,
      status: res.ok ? "UP" : "DOWN",
      responseTime: Math.round(end - start),
    };
  } catch {
    return {
      name: url,
      status: "DOWN",
    };
  }
}

// ✅ Main function (unchanged logic)
export async function getSiteHealth() {
  const endpoints = [
    "/",
    "/questions",
    "/report",
    "/admin",
    "admin/status",
    "/submit",
  ];

  const endpointChecks = endpoints.map((url) => checkEndpoint(url));

  const results = await Promise.all([
    ...endpointChecks
  ]);

  return results;
}