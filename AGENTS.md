# AGENTS.md

**zium.app** is a Formula 1 multi-view experience: a browser app for watching several F1 TV camera feeds at once in a resizable pit wall. It needs an F1 TV subscription and a companion Chrome extension.

Live: https://zium.app. Repo: https://github.com/bibixx/zium.app. Figma: https://www.figma.com/community/file/1250905585551204036/Zium.app. License: GPL v3+.

## Where to look

| Task | Read |
|---|---|
| What the app does, routes, flags | [docs/features.md](docs/features.md) |
| How boot, auth, playback, sync, layouts, hotkeys work | [docs/code-paths.md](docs/code-paths.md) |
| Conventions for new code | [docs/architecture.md](docs/architecture.md) |
| Tokens, typography, mixins, motion | [docs/design-system.md](docs/design-system.md) |
| How it should look and feel | [docs/design-language.md](docs/design-language.md) |
| Adding or changing a component | [src/components/AGENTS.md](src/components/AGENTS.md) |
| Modal surfaces | [docs/families/overlays.md](docs/families/overlays.md) |
| The `as` prop | [docs/families/polymorphic.md](docs/families/polymorphic.md) |
| Bugs and gaps | [docs/known-issues.md](docs/known-issues.md) |
| Chrome extension | [extension/AGENTS.md](extension/AGENTS.md) |

## Stack

React 18, strict TypeScript, Vite with SWC, Yarn (node-modules linker). Zustand and React Context for state, Zod for runtime validation, SCSS Modules with design tokens, Shaka Player with Widevine, PostHog, Heroicons, deployed on Vercel. Versions are in `package.json`.

## Commands

```bash
yarn dev           # Dev server
yarn build         # Type-check, lint, production build
yarn type-check    # tsc --noEmit
yarn lint          # ESLint, Stylelint, Prettier on SCSS, docs check
yarn lint:docs     # Docs check only
yarn build-tokens  # Regenerate theme CSS from tokens
```

There's no test framework. Types, Zod, lint, and manual checks in the browser are the safety net. Debug panel: `Ctrl+Shift+D`.

## Hard invariants

Breaking these has caused real bugs.

- **Persisted schemas stay backward compatible.** A failed parse deletes the stored value, which means all saved layouts. New fields need `.default()`, and new window types must be added to `useViewerState.validator.ts`.
- **Dragging must not reload video.** Windows are memoised, with stable references and callbacks that take IDs (`src/views/Viewer/Viewer.tsx`). Don't pass freshly created objects to video windows.
- **Never skip DRM setup based on the stream being HLS.** HLS can be encrypted. Reset DRM config and filters between sources (`configureDrm` in `src/components/VideoPlayer/VideoPlayer.tsx`).
- **Live sync prefers rate correction.** Live seeks land off target and loop. Don't seek buffering minions (`src/views/Viewer/hooks/useSyncVideos.ts`).
- **The main window can't be deleted or replaced by a non-main window.** Sync needs it.
- **Extension fields stay optional on the page.** The store version can lag behind the web app.
- **Keep the `identify` effect in the analytics provider, after opt-in** (`src/hooks/useAnalytics/useAnalytics.tsx`).
- **A new season needs** `SUPPORTED_SEASONS`, `SEASON_TO_F1_ID_MAP`, and driver avatars (the `f1-avatars` skill).

## Atoms

Check here before building a primitive. Each links to usage, props, do's and don'ts, and real examples.

| Atom | What it is |
|---|---|
| [Button](src/components/Button/AGENTS.md) | Action control in four emphasis levels that can render as any element through `as`. |
| [Input](src/components/Input/AGENTS.md) | Single-line text field with optional icon, clear button, and shortcut hint. |
| [Checkbox](src/components/Checkbox/AGENTS.md) | Labelled boolean toggle, used only in the debug panel today. |
| [Slider](src/components/Slider/AGENTS.md) | Horizontal 0 to 100 scrub track with optional buffer level and hover label. |
| [Tooltip](src/components/Tooltip/AGENTS.md) | Short hover or focus hint that renders nothing extra when its content is empty. |
| [Dialog](src/components/Dialog/AGENTS.md) | Centred modal with composable content parts for decisions and short forms. |
| [Sheet](src/components/Sheet/AGENTS.md) | Full-height right panel with a built-in Close button for lists and pickers. |
| [Dropdown](src/components/Dropdown/AGENTS.md) | Anchored action menu driven by a render-prop trigger and an options array. |
| [ListItem](src/components/ListItem/AGENTS.md) | Full-width selectable row with a caption that can render as any element. |
| [Snackbar](src/components/Snackbar/AGENTS.md) | Timed notification stack opened from anywhere through `useSnackbars`. |
| [KeyIndicator](src/components/KeyIndicator/AGENTS.md) | Single keyboard key shown as `<kbd>`, with friendly key names. |
| [Spinner](src/components/Spinner/AGENTS.md) | Rotating SVG shaped like an icon, for in-progress controls. |
| [Loader](src/components/Loader/AGENTS.md) | Looping Lottie animation for full-screen waits. |
| [Logo](src/components/Logo/AGENTS.md) | ZIUM wordmark sized by at least one dimension and coloured by a token. |
| [FadeInImage](src/components/FadeInImage/AGENTS.md) | Image that fades in once loaded and accepts a not-yet-known source. |
| [CustomIcons](src/components/CustomIcons/AGENTS.md) | SVG icons for F1 sessions and player actions that Heroicons doesn't cover. |
| [WithVariables](src/components/WithVariables/AGENTS.md) | Element that writes runtime values to CSS custom properties. |
| [TimedOutWrapper](src/components/TimedOutWrapper/AGENTS.md) | Hides loading placeholders until a delay passes, preventing flashes. |

## Molecules

| Component | What it is |
|---|---|
| `HumanReadableShortcuts` | Full shortcut display with platform-aware modifiers. |
| `ErrorMessage` | Inline error with fixed copy and a report link. |
| `FullScreenError` | Page-level error; stays router-free for the error boundary. |
| `ErrorBoundary` | Root boundary that reports to PostHog. |
| `CookieBanner` | Analytics consent banner, needs the analytics provider and router. |
| `OnboardingLayout` | Split layout with steps for onboarding screens. |

Other components are F1 or viewer specific and are covered by the features and code-paths docs. `EventCardTag` is the only tag-like component; generalise it rather than adding another.

## Working here

- Source types win if a doc disagrees with the code. Fix the doc.
- Each fact has one owner. Link to it rather than copying it.
- Change a contract and its doc in the same commit. `yarn lint:docs` catches structural drift, and the `docs-audit` skill checks the prose.
- Known issues aren't fixed in passing. A fix is its own change and removes the entry.
- Commit messages are imperative and capitalised, with no prefix: "Fix live stream sync drift loops".

## Agent Skills

Skills live in `.agents/skills/`, which Codex reads directly. `.claude/skills` is a symlink to it for Claude Code, so add or edit skills only in `.agents/skills/`.

The Chrome DevTools MCP server the browser skills depend on is configured in both `.mcp.json` (Claude Code) and `.codex/config.toml` (Codex). Keep the two in sync.
