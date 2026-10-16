import type { H3Event } from "h3";

import { serverSupabaseUser } from "#supabase/server";

import type { AiProfile } from "./ai";

export async function getAiProfile(event: H3Event): Promise<AiProfile> {
  const { ownerUserId } = useRuntimeConfig(event);
  if (!ownerUserId)
    return "demo";

  try {
    const user = await serverSupabaseUser(event);
    // Newer @nuxtjs/supabase returns JWT claims (`sub`), older versions return `id`
    const userId = (user as any)?.id ?? (user as any)?.sub;
    return userId && userId === ownerUserId ? "owner" : "demo";
  }
  catch {
    return "demo"; // no session, expired token, anything unexpected
  }
}
