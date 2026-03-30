import { supabase } from "@/lib/supabase";

export type ServiceStatus = {
  name: string;
  status: "UP" | "DOWN";
  responseTime?: number;
};

async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(id);
  }
}

async function checkEndpoint(url: string): Promise<ServiceStatus> {
  const start = performance.now();

  try {
    const res = await fetchWithTimeout(url);
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

// 🟢 Supabase health check
async function checkSupabase(): Promise<ServiceStatus> {
  const start = performance.now();

  try {
    // simplest lightweight query
    const { error } = await supabase.from("health").select("*").limit(1);

    const end = performance.now();

    if (error) throw error;

    return {
      name: "Supabase",
      status: "UP",
      responseTime: Math.round(end - start),
    };
  } catch {
    return {
      name: "Supabase",
      status: "DOWN",
    };
  }
}

export async function getSiteHealth() {
  const BASE_URL = window.location.origin;

  const endpoints = [
    `${BASE_URL}/`,
    `${BASE_URL}/questions`,
    `${BASE_URL}/report`,
    `${BASE_URL}/admin`,
    `${BASE_URL}/admin/status`,
    `${BASE_URL}/submit`,
  ];

  const endpointChecks = endpoints.map((url) => checkEndpoint(url));

  const results = await Promise.all([
    ...endpointChecks,
    checkSupabase(),
  ]);

  return results;
}