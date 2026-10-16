import { z } from "zod";

export const TONES = ["Casual", "Semi-Formal", "Formal"] as const;

export type Tone = (typeof TONES)[number];

export const draftRequestSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    company: z.string().trim().max(200).default(""),
    description: z.string().trim().max(20000).default(""),
    techStack: z.array(z.string().max(60)).max(40).default([]),
    applicationInstructions: z.array(z.string().max(500)).max(20).default([]),
    tone: z.enum(TONES),
    wantEmail: z.boolean(),
    wantCoverLetter: z.boolean(),
    instructions: z.string().trim().max(1000).default(""),
  })
  .refine(v => v.wantEmail || v.wantCoverLetter, {
    message: "Pick at least one: Email Draft or Cover Letter.",
  });
