import { describe, expect, it } from "vitest";

import type { JobSummary } from "../../app/types/job.types";

import { searchJobs } from "../../app/utils/search-filter";

const job = (title: string, company: string) => ({ id: title, title, company }) as unknown as JobSummary;

const jobs = [
  job("Junior Web Developer", "Acme Studio"),
  job("Frontend Engineer", "Starbreaker Corp"),
];

describe("searchJobs", () => {
  it("returns everything for a blank query", () => {
    expect(searchJobs(jobs, "   ")).toHaveLength(2);
  });

  it("matches the title or the company, ignoring case", () => {
    expect(searchJobs(jobs, "FRONTEND")).toEqual([jobs[1]]);
    expect(searchJobs(jobs, "acme")).toEqual([jobs[0]]);
  });

  it("requires every word, in any order", () => {
    expect(searchJobs(jobs, "studio junior")).toEqual([jobs[0]]);
    expect(searchJobs(jobs, "junior corp")).toEqual([]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(searchJobs(jobs, "zzz")).toEqual([]);
  });
});
