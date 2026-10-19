import type { Database } from "@/types/database.types";

export type JobRow
  = Database["public"]["Tables"]["jobs"]["Row"];

export type JobInsert
  = Database["public"]["Tables"]["jobs"]["Insert"];

export type JobUpdate
  = Database["public"]["Tables"]["jobs"]["Update"];

export type JobSummary = Pick<
  JobRow,
  | "id"
  | "slug"
  | "company"
  | "title"
  | "location"
  | "work_mode"
  | "salary"
  | "status"
  | "created_at"
  | "is_demo"
>;

export type JobListParams = { page: number; pageSize: number; status: string; search: string };
