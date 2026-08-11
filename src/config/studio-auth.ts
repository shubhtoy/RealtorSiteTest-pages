import { appEnv } from "@/config/env";

// Canonical Studio password source. No hardcoded fallback: when unset the gate
// resolves to "" and the Studio shows its "not configured" screen instead of
// silently accepting a known password.
export const STUDIO_PASSWORD = appEnv.studioPassword || "";

export const STUDIO_PASSWORD_ENV_HINT = "NEXT_PUBLIC_STUDIO_PASSWORD";
