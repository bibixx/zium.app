---
name: docs-audit
description: Compare zium's AGENTS.md and docs with the code changed since each doc was last updated, and fix claims that are no longer true. Use after larger changes, or when asked to audit, refresh or check the docs.
---

# Docs audit

`yarn lint:docs` catches structural drift. This skill covers what it can't: whether the prose is still true.

## Steps

1. Run `yarn lint:docs` and fix anything it reports first.
2. For each doc, find the code changed since the doc's last commit:

   ```bash
   last=$(git log -1 --format=%H -- <doc>)
   git log --oneline "$last"..HEAD -- <code-path>
   ```

   | Doc | Code path |
   |---|---|
   | `src/components/<Atom>/AGENTS.md` | `src/components/<Atom>/` |
   | `docs/families/overlays.md` | Dialog, Sheet, Dropdown folders |
   | `docs/families/polymorphic.md` | `src/utils/withAs.tsx` |
   | `docs/code-paths.md` | Each file the doc cites |
   | `docs/features.md` | `src/views/`, `src/App.tsx` |
   | `docs/architecture.md` | `src/hooks/`, `src/utils/` |
   | `docs/design-system.md` | `src/styles/`, `src/tokens/`, `tokens.config.cjs` |
   | `docs/design-language.md` | `src/styles/`, `src/views/Viewer/` |
   | `docs/known-issues.md` | Each file an entry cites |
   | `extension/AGENTS.md` | `extension/src/` |

3. Skip docs with no relevant commits. For the rest, read the doc against the current code.
4. Check for:
   - Do/Don't items that no longer hold, or a new rule the code now enforces
   - steps in a code path that moved or changed order
   - known issues that were fixed (delete the entry and its links) or newly found
   - new atoms, features, flags or routes missing from the tables
5. Fix what's clearly wrong in the owning doc. List anything that needs a human decision instead of guessing.
6. Run `yarn lint:docs` again and report what changed.
