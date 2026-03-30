import { useEffect, useState } from "react";
import { getSiteHealth, ServiceStatus } from "@/utils/siteHealth";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";

export default function AdminStatus() {
  const [status, setStatus] = useState<ServiceStatus[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadHealth() {
      const health = await getSiteHealth();
      setStatus(health);
    }

    loadHealth();
    const interval = setInterval(loadHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Login Required
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-10 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">System Status</h1>
          <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Admin
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {status.map((s) => (
            <div key={s.name} className="border border-border rounded-xl p-4 bg-card">
              <div className="flex justify-between text-sm font-medium">
                <span className="truncate">{s.name}</span>
                <span className={`shrink-0 ${s.status === "UP" ? "text-green-500" : "text-red-500"}`}>
                  {s.status}
                </span>
              </div>
              {s.responseTime && (
                <p className="text-xs text-muted-foreground mt-1">{s.responseTime} ms</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}