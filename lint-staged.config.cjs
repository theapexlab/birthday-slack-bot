module.exports = {
  "**/*.{js,ts}": ["pnpm lint", "pnpm format:check"],
  "**/*.ts": () => [
    "pnpm typecheck",
    "pnpm typecheck:core",
    "pnpm typecheck:functions",
  ],
};
