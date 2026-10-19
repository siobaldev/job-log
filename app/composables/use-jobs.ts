import type { JobInsert, JobListParams, JobRow, JobUpdate } from "~/types/job.types";

export function useJobs() {
  const supabase = useSupabaseClient();

  // Creates an invisible anonymous session if the visitor has none yet.
  const ensureSession = async (captchaToken?: string) => {
    const { data, error: sessionError } = await supabase.auth.getSession();

    if (sessionError)
      throw sessionError;

    if (data.session)
      return;

    const { error } = await supabase.auth.signInAnonymously({
      options: { captchaToken },
    });

    if (error)
      throw error;
  };

  const LIST_COLUMNS = "id, slug, company, title, location, work_mode, salary, status, created_at, is_demo" as const;

  const fetchJobPage = async ({ page, pageSize, status, search }: JobListParams) => {
    // These characters would break PostgREST's filter syntax or act as wildcards
    const term = search.replace(/[,()%_*\\"]/g, " ").trim();
    const from = (page - 1) * pageSize;

    let list = supabase
      .from("jobs")
      .select(LIST_COLUMNS)
      .order("created_at", { ascending: false })
      .order("id") // stable order for rows with identical timestamps
      .range(from, from + pageSize - 1);

    let tally = supabase.from("jobs").select("status"); // cheap: one column

    if (term) {
      const filter = `company.ilike.%${term}%,title.ilike.%${term}%`;
      list = list.or(filter);
      tally = tally.or(filter);
    }

    if (status !== ALL_JOBS)
      list = list.eq("status", status);

    const [listRes, tallyRes] = await Promise.all([list, tally]);

    if (tallyRes.error)
      throw tallyRes.error;

    const counts: Record<string, number> = { [ALL_JOBS]: tallyRes.data.length };

    for (const row of tallyRes.data) counts[row.status] = (counts[row.status] ?? 0) + 1;

    const total = status === ALL_JOBS ? counts[ALL_JOBS]! : (counts[status] ?? 0);

    // A page past the end (for example a stale link) is not a real error
    if (listRes.error && listRes.error.code !== "PGRST103")
      throw listRes.error;

    return { jobs: (listRes.data ?? []), total, counts };
  };

  const fetchJobBySlug = async (slug: string): Promise<JobRow | null> => {
    const { data, error } = await supabase.from("jobs").select("*").eq("slug", slug).maybeSingle();
    if (error)
      throw error;

    return data;
  };

  const addJob = async (job: JobInsert, captchaToken?: string): Promise<JobRow> => {
    await ensureSession(captchaToken);

    const { data, error } = await supabase
      .from("jobs")
      .insert(job)
      .select()
      .single();

    if (error)
      throw error;

    return data;
  };

  const updateJobStatus = async (id: string, status: JobUpdate["status"]): Promise<void> => {
    const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
    if (error)
      throw error;
  };

  const deleteJob = async (id: string): Promise<void> => {
    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error)
      throw error;
  };

  const saveDraft = async (id: string, draft: Pick<JobUpdate, "email_subject" | "email_body" | "cover_letter">): Promise<void> => {
    const { error } = await supabase
      .from("jobs")
      .update(draft)
      .eq("id", id);

    if (error)
      throw error;
  };

  return {
    fetchJobPage,
    fetchJobBySlug,
    addJob,
    updateJobStatus,
    deleteJob,
    saveDraft,
  };
}
