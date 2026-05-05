import { AdminAuthService } from "@/lib/admin-auth";
import { appEnv } from "@/config/env";

// Canonical studio password source. Legacy key support is retained for backwards compatibility.
export const STUDIO_PASSWORD =
  appEnv.studioPassword || AdminAuthService.getPassword(["VITE_STUDIO_BASIC_PASSWORD"]) || "shubh123";

export const STUDIO_PASSWORD_ENV_HINT = "VITE_STUDIO_PASSWORD";
