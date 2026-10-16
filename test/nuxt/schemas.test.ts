import { describe, expect, it } from "vitest";

import { extractFormSchema } from "#shared/schemas/extract";

import { extractedJobSchema } from "../../server/utils/extracted-job-schema";
import { parseJsonLoose } from "../../server/utils/parse-json";

describe("extractFormSchema", () => {
  it("asks for a posting when the text is blank", () => {
    const result = extractFormSchema.safeParse({ jobText: "   " });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Paste a job posting first.");
  });

  it("rejects text that is too short", () => {
    expect(extractFormSchema.safeParse({ jobText: "x".repeat(49) }).success).toBe(false);
  });

  it("accepts 50 characters and trims the text", () => {
    const result = extractFormSchema.safeParse({ jobText: `  ${"x".repeat(50)}  ` });
    expect(result.data?.jobText).toBe("x".repeat(50));
  });

  it("rejects absurdly long text", () => {
    expect(extractFormSchema.safeParse({ jobText: "x".repeat(1_000_000) }).success).toBe(false);
  });
});

describe("extractedJobSchema", () => {
  const base = { company: "Acme", title: "Developer" };

  it("strips bullets and numbering the model copied", () => {
    const out = extractedJobSchema.parse({
      ...base,
      techStack: ["- Next.js", "\u2022 React", "1. Zustand"],
      applicationInstructions: ["* Start with Personal"],
    });
    expect(out.techStack).toEqual(["Next.js", "React", "Zustand"]);
    expect(out.applicationInstructions).toEqual(["Start with Personal"]);
  });

  it("keeps decimals and versions intact", () => {
    const out = extractedJobSchema.parse({ ...base, techStack: ["Next.js 15", "3.5 Flash"] });
    expect(out.techStack).toEqual(["Next.js 15", "3.5 Flash"]);
  });

  it("removes duplicate technologies and caps a runaway list", () => {
    const duplicates = extractedJobSchema.parse({ ...base, techStack: ["React", "React"] });
    expect(duplicates.techStack).toEqual(["React"]);

    const many = Array.from({ length: 50 }, (_, i) => `Tool${i}`);
    expect(extractedJobSchema.parse({ ...base, techStack: many }).techStack.length).toBeLessThan(50);
  });

  it("falls back to safe defaults for wrong types", () => {
    const out = extractedJobSchema.parse({ company: 123, title: null, techStack: "React" });
    expect(out.company).toBe("");
    expect(out.title).toBe("");
    expect(out.techStack).toEqual([]);
  });

  it("treats a missing isJobPosting as true", () => {
    expect(extractedJobSchema.parse(base).isJobPosting).toBe(true);
  });
});

describe("parseJsonLoose", () => {
  it("parses plain JSON", () => {
    expect(parseJsonLoose("{\"a\": 1}")).toEqual({ a: 1 });
  });

  it("strips a markdown code fence", () => {
    expect(parseJsonLoose("```json\n{\"a\": 1}\n```")).toEqual({ a: 1 });
  });

  it("finds the object when the model adds text around it", () => {
    expect(parseJsonLoose("Here is the data:\n{\"a\": 1}\nHope that helps!")).toEqual({ a: 1 });
  });

  it("keeps braces that appear inside strings", () => {
    expect(parseJsonLoose("{\"a\": \"use {braces}\"}")).toEqual({ a: "use {braces}" });
  });

  it("throws when there is no JSON object", () => {
    expect(() => parseJsonLoose("Sorry, I can't help with that.")).toThrow();
  });
});
