import { z } from "zod";

// Strips leading bullets, dashes, and numbering the model sometimes copies from the posting.
const LEADING_MARKER = /^\s*(?:[-\u2013\u2014\u2022*\u00B7\u25CF\u25AA\u25E6]+\s*|\d+[.)]\s+)/;

// Optional fields: anything wrong becomes empty
const text = z.string().transform(value => value.trim()).catch("");

const list = z
  .array(z.string().transform(value => value.replace(LEADING_MARKER, "").trim()))
  .transform(items => items.filter(Boolean))
  .catch([]);

const techList = list.transform(items => [...new Set(items)].slice(0, 8));

export const extractedJobSchema = z.object({
  company: text,
  title: text,
  location: text,
  workMode: text,
  schedule: text,
  salary: text,
  summary: text,
  techStack: techList,
  applicationInstructions: list,
  link: text,
  description: text,
  isJobPosting: z.boolean().catch(true),
});
