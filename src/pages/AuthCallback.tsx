import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/admin", { replace: true });
      } else {
        supabase.auth.exchangeCodeForSession(window.location.href).then(() => {
          navigate("/admin", { replace: true });
        });
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground text-sm">
        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        Signing you in…
      </div>
    </div>
  );
}