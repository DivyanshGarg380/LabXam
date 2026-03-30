import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";


export async function signInWithGoogle() {
  console.log("Redirect URL:", `${window.location.origin}/auth/callback`);
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session?.user ?? null);
    }
  );
  return subscription;
};

export const isAdmin = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("admins")
    .select("email")
    .eq("email", email)
    .single();

  return !error && !!data;
};