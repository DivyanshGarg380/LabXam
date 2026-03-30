jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(),
  },
}));

import {
  signInWithGoogle,
  signOut,
  getSession,
  onAuthStateChange,
  isAdmin,
} from "@/supabase/auth";

import { supabase } from "@/lib/supabase";

type AuthCallback = (
  event: string,
  session: { user: { id: string } } | null
) => void;

describe("Auth functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls Google OAuth correctly", async () => {
    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
      error: null,
    });

    await signInWithGoogle();

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "http://localhost/auth/callback",
      },
    });
  });

  it("throws error if Google sign-in fails", async () => {
    (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
      error: new Error("OAuth failed"),
    });

    await expect(signInWithGoogle()).rejects.toThrow("OAuth failed");
  });

  it("signs out successfully", async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({
      error: null,
    });

    await expect(signOut()).resolves.not.toThrow();
  });

  it("throws error if signOut fails", async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({
      error: new Error("Signout failed"),
    });

    await expect(signOut()).rejects.toThrow("Signout failed");
  });

  it("returns session", async () => {
    const mockSession = { user: { id: "123" } };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
    });

    const res = await getSession();

    expect(res).toBe(mockSession);
  });

  it("calls callback with user", () => {
    const mockCallback = jest.fn();
    const fakeSubscription = { unsubscribe: jest.fn() };

    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
      (cb: AuthCallback) => {
        cb("SIGNED_IN", { user: { id: "123" } });
        return {
          data: { subscription: fakeSubscription },
        };
      }
    );

    const sub = onAuthStateChange(mockCallback);

    expect(mockCallback).toHaveBeenCalledWith({ id: "123" });
    expect(sub).toBe(fakeSubscription);
  });

  it("handles null session in auth state change", () => {
    const mockCallback = jest.fn();

    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation(
      (cb: AuthCallback) => {
        cb("SIGNED_OUT", null);
        return {
          data: { subscription: {} },
        };
      }
    );

    onAuthStateChange(mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(null);
  });

  it("returns true if user is admin", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { email: "admin@test.com" },
            error: null,
          }),
        }),
      }),
    });

    const res = await isAdmin("admin@test.com");

    expect(res).toBe(true);
  });

  it("returns false if user is not admin", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: null,
            error: { message: "Not found" },
          }),
        }),
      }),
    });

    const res = await isAdmin("user@test.com");

    expect(res).toBe(false);
  });
});