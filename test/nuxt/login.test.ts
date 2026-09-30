import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";

import LoginPage from "~/pages/login.vue";

mockNuxtImport("useAuth", () => () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

describe("login page validation", () => {
  it("shows no errors before submit", async () => {
    const wrapper = await mountSuspended(LoginPage);
    expect(wrapper.text()).not.toContain("Enter a valid email");
  });

  it("shows errors after submitting an empty form", async () => {
    const wrapper = await mountSuspended(LoginPage);
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("Enter a valid email");
    });
  });
});
