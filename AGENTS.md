# AGENTS.md

## Project

**zium.app** — Formula 1 Multi-View Experience. A browser app that lets users watch F1 races from multiple camera angles simultaneously, creating their own responsive pit-wall. Requires an active F1 TV subscription and a companion Chrome extension for API auth.

- **Live app:** https://zium.app
- **Repo:** https://github.com/bibixx/zium.app
- **Figma:** https://www.figma.com/community/file/1250905585551204036/Zium.app
- **License:** GPL v3+
- **Authors:** Bartosz Legięć (development), Adam Ruthendorf-Przewoski (design)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18, TypeScript 5 (strict mode) |
| Build | Vite 4 + SWC, Yarn 3.5 (PnP w/ node-modules linker) |
| State | Zustand (global), React Context (providers), useReducer (async) |
| Validation | Zod (runtime schema validation for all API responses + localStorage) |
| Styling | SCSS + CSS Modules (camelCase), Design Tokens via Style Dictionary |
| Video | Shaka Player 5 (primary), HLS/DASH with Widevine DRM |
| Analytics | PostHog (migrated from Sentry & Matomo) |
| Icons | Heroicons (20/solid, 24/outline) |
| Animations | React Transition Group, Lottie, CSS @keyframes + spring physics |
| Deployment | Vercel (SPA rewrites, immutable asset caching) |

## Directory Structure

```
src/
├── views/           # Page-level components (Races, Viewer, LogIn, etc.)
├── components/      # 40+ reusable UI components
├── hooks/           # 30+ custom hooks (data fetching, state, UI, utilities)
├── utils/           # 35+ utility functions (api, validators, helpers)
├── types/           # Centralized TypeScript type definitions
├── constants/       # App constants (seasons, races, portals)
├── styles/          # Global SCSS, mixins, CSS variables
├── tokens/          # Design tokens (light.json, dark.json → CSS vars)
└── assets/          # Static assets

extension/           # Chrome extension companion (auth bridge to F1TV API)
vite/                # Custom Vite plugins
```

## Core Architecture Patterns

### Hook Co-location

Each hook lives in its own directory with co-located files by suffix:

```
useHookName/
├── useHookName.tsx          # Main hook
├── useHookName.api.ts       # API calls (fetchJSON wrapper)
├── useHookName.validator.ts # Zod schema (source of truth for types)
├── useHookName.utils.ts     # Transformation/normalization helpers
├── useHookName.types.ts     # Type definitions
├── useHookName.constants.ts # Constants
└── useHookName.hooks.ts     # Sub-hooks (component-specific)
```

### API Data Flow

```
Component → Custom Hook (useReducer: loading|error|done)
  → .api.ts (fetchJSON against f1tv.formula1.com)
    → Zod validation (.validator.ts)
      → Transformation (.utils.ts)
        → Normalized domain model
```

- All API responses are validated with Zod before use — validators are the source of truth for types
- `fetchJSON` in `src/utils/api.ts` wraps native fetch with `ApiError` class (status, headers, body)
- AbortSignal support throughout for request cancellation
- No React Query/SWR — custom hooks with useReducer for async state

### State Management

- **Zustand:** Auth state (`useLoggedInStore`), Feature flags (`useFeatureFlags` with persist middleware), Hotkeys (`useHotkeysStore`), Snackbars
- **React Context:** Theme, Analytics (PostHog), ViewerUIVisibility, UserOffsets, StreamPicker
- **localStorage:** Persisted via `LocalStorageClient<T extends ZodType>` — generic class with Zod validation on read/write, auto-removal on schema mismatch

### Discriminated Unions

Used for exhaustive pattern matching throughout:
```typescript
// Response type — every async hook uses this
type Response<T> = { state: "loading" } | { state: "error"; error: Error } | { state: "done"; data: T };

// Grid windows — each window type is a tagged variant
type GridWindow = MainGridWindow | DriverTrackerGridWindow | DataChannelGridWindow | DriverGridWindow;
```
Combined with `assertNever()` for compile-time exhaustiveness checking.

### Component Patterns

- **Polymorphic components:** `withAs("button")` utility enables `as` prop for rendering as different elements
- **CSS Modules:** `classnames` (aliased as `cn`) for conditional class application
- **Dynamic CSS vars:** `WithVariables` component injects CSS custom properties (cursor position, dimensions, offsets)
- **Portals:** Dialog, Sheet, Snackbar render via `createPortal` to overlay container
- **No barrel files** — all imports are explicit/relative for better tree-shaking

## Key Focus Areas

### Keyboard-First UX

Scoped hotkey system built on Zustand (`src/hooks/useHotkeys/`):
- Scope-based prioritization — later registered scopes take precedence
- `allowPropagation` flag controls whether handling continues through scopes
- Platform-aware modifiers (Cmd on Mac, Ctrl on Windows)
- `enableOnFormTags` option to selectively allow shortcuts in inputs
- Comprehensive shortcuts: playback (Space, arrows, `.`/`,`), layout switching (Alt+1-9), fullscreen (f), mute (m), closed captions (c), search (/), help (Cmd+?)
- All shortcuts defined in `src/hooks/useHotkeys/useHotkeys.keys.tsx`
- Human-readable shortcut display with `<kbd>` elements and platform-aware symbols

### Multi-Window Video System

Custom drag/resize implementation (no DND library):
- **RnDWindow:** Draggable + resizable windows with 8 resize handles, grid snapping, minimum size constraints
- **Grid snapping:** Configurable grid size with Shift (8px fine) and Cmd/Ctrl (freeform) modifiers
- **Layout persistence:** Save/load named layouts, switch via Alt+number shortcuts
- **Stream sync:** `useSyncVideos` keeps multiple video players in sync; per-window time offsets via `useUserOffsets`
- **Stream types:** Main feed, international (with language selection), driver onboard cameras, driver tracker, data channel
- **Spring physics:** Snackbar drag, Player collapse/expand, window interactions

### Design Token System

Figma → Code pipeline:
1. Tokens in `src/tokens/light.json` and `dark.json` (from Figma via Tokens Studio)
2. `token-transformer` expands typography/shadow/composition/border tokens
3. `style-dictionary` builds CSS custom properties → `src/styles/theme/light.css` and `dark.css`
4. GitHub Action auto-commits generated CSS when token files change
5. Theme switching via `ThemeProvider` (Context) — toggles `html.light` class, stored in localStorage, system preference fallback

Token categories: colors (semantic), typography, motion (timing functions + durations), elevation (shadow depths), radii, spacing.

### Accessibility

- **Focus traps:** `focus-trap-react` in Dialog, Sheet, Dropdown — with `allowOutsideClick: true`
- **ARIA labels:** All interactive elements (buttons, inputs, dropdowns) have descriptive aria-labels
- **Keyboard navigation:** Arrow keys in dropdowns, Tab/Shift+Tab cycling, Enter to select
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` respected, `noTransition` class during theme switches
- **Input mode detection:** `what-input` library for keyboard-vs-mouse focus styling (`[data-whatinput="keyboard"]`)
- **Semantic HTML:** `<button>`, `<kbd>`, `<a>`, native checkboxes wrapped in `<label>`

### Animations

Three-tier system:
1. **CSS transitions:** Token-driven durations (`--transition-fast/medium/slow`) with custom easing curves
2. **React Transition Group:** State-based enter/exit animations for Dialog, Dropdown, Snackbar (CSSTransition with named class stages)
3. **Spring physics:** Custom implementations for drag interactions (Snackbar, Player, RnDWindow) with configurable spring constants and snap thresholds

## Development

### Commands

```bash
yarn dev              # Dev server
yarn build            # TypeScript check → Lint → Vite build
yarn type-check       # tsc --noEmit
yarn lint:ts          # ESLint
yarn lint:css         # Stylelint + Prettier on SCSS
yarn lint             # All linting
yarn build-tokens     # Regenerate CSS from design tokens
```

### Code Quality

- **ESLint:** TypeScript + React + React Hooks + Prettier + Import ordering
- **Prettier:** Double quotes, trailing commas, 120 char line width
- **Stylelint:** Standard SCSS config + custom property validation against theme files
- **TypeScript:** Strict mode, no JS allowed, CSS Modules plugin with camelCase
- **No test framework** — relies on TypeScript strict mode + linting + Zod runtime validation

### Code Splitting

- `lazyWithPreload()` utility for lazy loading with early prefetch (Viewer component)
- Vite manual chunks: `shaka`, `lottie`, `vendor` bundles separated from app code

### Chrome Extension

Located in `extension/` — required for the app to function:
- Handles F1TV OAuth authentication (credentials never leave the user's device)
- CORS proxy for API requests to formula1.com
- `postMessage` API bridge between page and extension (`src/utils/extensionApi.ts`)
- Token change listeners for real-time auth state updates

### SCSS Path Alias

`@@` → `src/styles/mixins.scss` (configured in tsconfig.json for CSS Modules plugin)

### Feature Flags

Debug flags in `src/hooks/useFeatureFlags/` (Zustand + persist + Zod validation):
`forceUiVisibility`, `forceTVAccess`, `increaseBackgroundContrast`, `showWindowBorders`, `disableLiveNotifications`

Toggle via Debug Panel: `Ctrl+Shift+D`
