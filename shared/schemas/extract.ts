import { z } from "zod";

export const extractFormSchema = z.object({
  jobText: z.string()
    .trim()
    .min(1, "Paste a job posting first.")
    .min(50, "That looks too short. Paste the full job posting.")
    .max(10000, "That's too long. Keep it under 10,000 characters."),
});
