import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";

const { signInWithPassword } = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
}));

mockNuxtImport("useSupabaseClient", () => () => ({
  auth: { signInWithPassword },
}));

describe("useAuth", () => {
  it("throws when Supabase returns an error", async () => {
    signInWithPassword.mockResolvedValue({ error: new Error("bad creds") });
    const { signIn } = useAuth();
    await expect(signIn("a@b.com", "wrong")).rejects.toThrow("bad creds");
  });

  it("does not throw when Supabase returns no error", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    const { signIn } = useAuth();
    await expect(signIn("a@b.com", "correct-password")).resolves.not.toThrow();
  });
});
