// Empty stub aliased in place of the `server-only` / `client-only` marker
// packages during Vitest runs. Those packages exist only to fail the build when
// a server/client module is imported into the wrong bundle; under Node-based
// tests there is no such boundary, so they resolve to this no-op.
export {};
