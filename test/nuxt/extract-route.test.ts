import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { completeJson } from "../../server/utils/ai";
import { AI_BAD_RESPONSE, AI_ERRORS, NOT_A_JOB_POSTING } from "../../server/utils/ai-error-message";
import { extractedJobSchema } from "../../server/utils/extracted-job-schema";
import { stubNitroGlobals } from "../helper/nitro-globals";

vi.mock("../../server/utils/ai", () => ({
  completeJson: vi.fn(),

}));
vi.mock("../../server/utils/profile", () => ({
  getAiProfile: vi.fn().mockResolvedValue("demo"),
}));

const readBody = vi.fn();
let handler: (event: unknown) => Promise<Record<string, any>>;

const posting = "We are hiring a junior web developer to join our remote team. ".repeat(3);
const goodJob = {
  isJobPosting: true,
  company: "Acme",
  title: "Junior Web Developer",
  location: "Manila",
  workMode: "Remote",
  schedule: "Full-time",
  salary: "PHP 30,000",
  summary: "Builds client sites.",
  techStack: ["Vue"],
  applicationInstructions: ["Start with Personal"],
  description: "## About\n\nBuild sites.",
  link: "",
};

function aiReturns(data: unknown) {
  vi.mocked(completeJson).mockResolvedValue(typeof data === "string" ? data : JSON.stringify(data));
}

beforeAll(async () => {
  stubNitroGlobals(readBody);
  handler = (await import("../../server/api/extract.post")).default as typeof handler;
});

beforeEach(() => {
  readBody.mockReset().mockResolvedValue({ jobText: posting });
  vi.mocked(completeJson).mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("pOST /api/extract", () => {
  it("rejects invalid text without calling the AI", async () => {
    readBody.mockResolvedValue({ jobText: "hi" });
    await expect(handler({})).rejects.toMatchObject({ statusCode: 400 });
    expect(completeJson).not.toHaveBeenCalled();
  });

  it("returns the extracted fields in snake_case", async () => {
    aiReturns(goodJob);
    expect(await handler({})).toMatchObject({
      company: "Acme",
      title: "Junior Web Developer",
      work_mode: "Remote",
      tech_stack: ["Vue"],
      application_instructions: ["Start with Personal"],
      description: "## About\n\nBuild sites.",
    });
  });

  it("rejects text the AI says is not a job posting", async () => {
    aiReturns({ ...goodJob, isJobPosting: false });
    await expect(handler({})).rejects.toMatchObject({ statusCode: 422, statusMessage: NOT_A_JOB_POSTING });
  });

  it("rejects a result with no title and no company", async () => {
    aiReturns({ ...goodJob, title: "", company: "" });
    await expect(handler({})).rejects.toMatchObject({ statusCode: 422 });
  });

  it("returns a friendly error when the AI does not return JSON", async () => {
    aiReturns("Sorry, I can't help with that.");
    await expect(handler({})).rejects.toMatchObject({ statusCode: 502, statusMessage: AI_BAD_RESPONSE });
  });

  it("maps a provider 503 to the friendly message", async () => {
    vi.mocked(completeJson).mockRejectedValue({ status: 503 });
    await expect(handler({})).rejects.toMatchObject({ statusCode: 502, statusMessage: AI_ERRORS[503] });
  });

  it("keeps 429 as 429", async () => {
    vi.mocked(completeJson).mockRejectedValue({ status: 429 });
    await expect(handler({})).rejects.toMatchObject({ statusCode: 429, statusMessage: AI_ERRORS[429] });
  });

  it("asks the AI for every field the schema reads", async () => {
    aiReturns(goodJob);
    await handler({});
    const { system } = vi.mocked(completeJson).mock.calls[0]![0];
    const shapeLine = system.split("\n").find((line: string) => line.trim().startsWith("{ \""));
    expect(shapeLine).toBeDefined();
    for (const key of Object.keys(extractedJobSchema.shape))
      expect(shapeLine, `"${key}" is missing from the JSON shape in the prompt`).toContain(`"${key}"`);
  });
});
