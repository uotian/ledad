# 02 Codex Rule

These rules describe how Codex should work in this repository beyond framework-specific guidance.

## Working Style

- Prefer incremental changes over large rewrites unless a rewrite is explicitly requested.
- Preserve the current product direction unless a redesign or broader refactor is requested.
- Prefer modern, standard-friendly choices unless there is a clear repo-specific reason not to.
- When refreshing project foundations, keep the migration history easy to review.

## Git And Commits

- Keep commits small and intentionally separated by purpose.
- Separate foundation changes, tooling changes, and product changes whenever practical.
- Do not rewrite history unless explicitly requested.
- If history cleanup is requested, keep backup branches before force-pushing.

## Validation

- Run `lint` after meaningful code changes.
- Run `typecheck` when TypeScript behavior or API shapes changed.
- Run `build` when changes affect application wiring, framework behavior, or release confidence.
- For visible UI changes, do a quick visual sanity check when practical.

## Ask Before

- Ask before introducing major dependencies that are not clearly aligned with the current stack.
- Ask before making destructive data changes, auth changes, payment changes, or external API contract changes.
- Ask before broad rewrites when a smaller fix is viable.

## Response Style

- Use Japanese for user-facing explanations unless asked otherwise.
- Keep explanations concise and practical.
- Briefly state what changed, what was verified, and any remaining risk or follow-up.
