import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

export type ServiceStatus = {
    name: string;
    status: "UP" | "DOWN";
    responseTime? : number;
};

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


async function checkFirestore(): Promise<ServiceStatus> {
  try {
    const start = performance.now();

    const ref = doc(db, "health", "ping");
    await getDoc(ref);

    const end = performance.now();

    return {
      name: "Firestore",
      status: "UP",
      responseTime: Math.round(end - start),
    };
  } catch {
    return {
      name: "Firestore",
      status: "DOWN",
    };
  }
}

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
    ...endpointChecks,
    checkFirestore(),
  ]);

  return results;
}

