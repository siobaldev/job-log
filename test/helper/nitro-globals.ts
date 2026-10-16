import { vi } from "vitest";

export function stubNitroGlobals(readBody: (event: unknown) => unknown) {
  vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);
  vi.stubGlobal("readBody", readBody);
  vi.stubGlobal("createError", (input: { statusCode: number; statusMessage: string }) =>
    Object.assign(new Error(input.statusMessage), input));
}
