// ai-error-messages.ts
// Keyed by the HTTP status the AI service returned
export const AI_ERRORS: Record<number, string> = {
  402: "The AI service has run out of credits.",
  408: "The AI service took too long to respond. Try again.",
  429: "Too many requests. Wait a bit before trying again.",
  502: "The AI service is having trouble right now. Try again in a moment.",
  503: "The AI service is having trouble right now. Try again in a moment.",
  504: "The AI service took too long to respond. Try again.",
};

// Messages for our own checks
export const AI_ERROR_FALLBACK = "Could not reach the AI service. Try again.";
export const AI_BAD_RESPONSE = "The AI returned something unexpected. Try again.";
export const NOT_A_JOB_POSTING = "That doesn't look like a job posting. Paste the full posting and try again.";
