import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { completeJson } from "../../server/utils/ai";
import { AI_BAD_RESPONSE } from "../../server/utils/ai-error-message";
import { stubNitroGlobals } from "../helper/nitro-globals";

vi.mock("../../server/utils/ai", () => ({
  completeJson: vi.fn(),
}));
vi.mock("../../server/utils/profile", () => ({
  getAiProfile: vi.fn().mockResolvedValue("demo"),
}));

const readBody = vi.fn();
let handler: (event: unknown) => Promise<Record<string, any>>;

function body(overrides: Record<string, unknown> = {}) {
  return {
    title: "Junior Web Developer",
    company: "Acme",
    techStack: ["Vue", "Nuxt"],
    applicationInstructions: ["Start your email with the word Personal"],
    description: "Build and maintain client sites.",
    instructions: "",
    tone: "Semi-Formal",
    wantEmail: true,
    wantCoverLetter: false,
    ...overrides,
  };
}

const draft = {
  emailSubject: "Application: Junior Web Developer",
  emailBody: "Personal\n\nHello, I would like to apply.",
  coverLetter: "Dear Hiring Manager, I am excited to apply.",
};

function aiReturns(data: unknown) {
  vi.mocked(completeJson).mockResolvedValue(typeof data === "string" ? data : JSON.stringify(data));
}

function sentToAi() {
  return vi.mocked(completeJson).mock.calls[0]![0];
}

beforeAll(async () => {
  stubNitroGlobals(readBody);
  handler = (await import("../../server/api/draft.post")).default as typeof handler;
});

beforeEach(() => {
  readBody.mockReset().mockResolvedValue(body());
  vi.mocked(completeJson).mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("pOST /api/draft", () => {
  it("rejects an unknown tone without calling the AI", async () => {
    readBody.mockResolvedValue(body({ tone: "Shouty" }));
    await expect(handler({})).rejects.toMatchObject({ statusCode: 400 });
    expect(completeJson).not.toHaveBeenCalled();
  });

  it("rejects a request that asks for nothing", async () => {
    readBody.mockResolvedValue(body({ wantEmail: false, wantCoverLetter: false }));
    await expect(handler({})).rejects.toMatchObject({ statusCode: 400 });
    expect(completeJson).not.toHaveBeenCalled();
  });

  it("returns only the email when only the email is requested", async () => {
    aiReturns(draft);
    expect(await handler({})).toEqual({
      emailSubject: draft.emailSubject,
      emailBody: draft.emailBody,
      coverLetter: null,
    });
  });

  it("returns only the cover letter when only that is requested", async () => {
    readBody.mockResolvedValue(body({ wantEmail: false, wantCoverLetter: true }));
    aiReturns(draft);
    expect(await handler({})).toEqual({
      emailSubject: null,
      emailBody: null,
      coverLetter: draft.coverLetter,
    });
  });

  it("returns both when both are requested", async () => {
    readBody.mockResolvedValue(body({ wantCoverLetter: true }));
    aiReturns(draft);
    expect(await handler({})).toEqual(draft);
  });

  it("fails when the email was requested but the AI left it empty", async () => {
    aiReturns({ ...draft, emailBody: "" });
    await expect(handler({})).rejects.toMatchObject({ statusCode: 502, statusMessage: AI_BAD_RESPONSE });
  });

  it("sends the posting's instructions and the applicant's own notes to the AI", async () => {
    readBody.mockResolvedValue(body({ instructions: "I have 2 years of Vue experience." }));
    aiReturns(draft);
    await handler({});
    expect(sentToAi().user).toContain("Start your email with the word Personal");
    expect(sentToAi().user).toContain("I have 2 years of Vue experience.");
  });

  it("changes the system prompt with the tone", async () => {
    aiReturns(draft);
    await handler({});
    const semiFormal = sentToAi().system;

    vi.mocked(completeJson).mockClear();
    readBody.mockResolvedValue(body({ tone: "Formal" }));
    await handler({});
    expect(sentToAi().system).not.toBe(semiFormal);
  });
});
