# Architecture

The patterns this codebase follows. Match them in new code. Deviations listed here are history, not precedent.

## Layout

| Path | Contents |
|---|---|
| `src/views/` | Routes and view-specific components and hooks |
| `src/components/` | Reusable UI |
| `src/hooks/` | Shared hooks, data fetching, stores |
| `src/utils/`, `src/types/`, `src/constants/` | Shared helpers, types, constants |
| `src/styles/`, `src/tokens/` | Global SCSS, generated themes, tokens |
| `extension/` | Companion Chrome extension, a separate Yarn project |

## Files and naming

- Components: `src/components/<Name>/<Name>.tsx` with `<Name>.module.scss`. Sub-components nest inside the parent's folder.
- Hooks: `src/hooks/<useName>/<useName>.ts`, with co-located suffix files: `.api`, `.validator`, `.utils`, `.types`, `.constants`, `.hooks`.
- No barrel files. Imports are relative, external packages first, the styles import last.
- Named `export const` everywhere. Default exports exist only where lazy loading needs one (`src/views/Viewer/Viewer.tsx`) and for `App`.
- Props are an unexported `interface FooProps` directly above the component, with defaults in the destructure. No `React.FC`.
- Variant strings are PascalCase (`"Primary"`).
- Private helpers sit below the component as hoisted `function` declarations.
- DOM variables take a `$` prefix (`$portalContainer`).

## Data fetching

```
Component → hook (useReducer) → .api.ts (fetchJSON + signal) → Zod validator → .utils.ts → domain model
```

- No React Query or SWR. Each hook has its own `useReducer` over `Response<T>` (`src/types/Response.ts`): `loading`, `error`, `done`.
- `signal` is a required argument of `fetchJSON` (`src/utils/api.ts`). Create the `AbortController` in the effect and abort in cleanup. Refetchable hooks keep it in a ref.
- Validators are the source of truth for types, using `z.output`. `validateArray` (`src/utils/validators.ts`) drops invalid list items instead of failing the list.
- `validateZodValidator` keeps hand-written persisted types and their schemas in step.
- Consumers branch on `state` with early returns.
- On failure: dispatch the error and call `posthog.captureException`.

Not validated: live timing keyframes and streams (`useLiveTimingData`).

## Exhaustiveness

Discriminated unions with `assertNever` (`if` chains ending in `return assertNever(x)`) for grid windows, routes, and viewer actions. Use it whenever a union can grow.

## State

| Kind | Tool | Example |
|---|---|---|
| Global app state | Zustand | `useLoggedInState`, `useHotkeys`, `useFeatureFlags`, snackbars |
| Tree-scoped services | Context + guarded hook | `useUserOffests`, `useAnalytics` |
| Persisted | `LocalStorageClient` | `src/utils/localStorageClient.ts` |
| Viewer layouts | Reducer with `withLocalStorage` | `useViewerState` |

- Context: `createContext<T | null>(null)` and a hook that calls `assertNotNullable(context, "Using uninitialised XContext")`.
- Zustand: actions live in the store. A store can stay private behind selector hooks, with an `Executor` hook for side effects (`useLoggedInStateExecutor`).
- `LocalStorageClient` validates on read and removes values that fail. `set` doesn't validate.

## Refs over state for high-frequency updates

Anything per-frame or per-mousemove writes to the DOM or a ref, and React state changes on completion.

- `useDrag` and `useResize` under `src/components/RnDWindow/hooks/` mutate styles and dispatch on mouseup.
- `useUserOffests` is a ref plus an emitter, with an opt-in reactive hook.
- `useStateWithRef` returns `[state, ref, update]`.

## Components

- Polymorphism: [polymorphic family](families/polymorphic.md).
- Overlays: [overlays family](families/overlays.md).
- `memo` is reserved for the video windows and `Viewer`, where a re-render costs playback.

## Errors

- One root `ErrorBoundary` in `src/App.tsx`, falling back to `FullScreenError`, which must stay router-free because it renders outside the router.
- Invariants throw. Non-fatal issues use `captureWarning`.

## Tooling

- ESLint: import order, `chrome` global banned, `exhaustive-deps` as a warning that also covers `useHotkeys`.
- Prettier: 120 columns, double quotes, trailing commas.
- TypeScript strict. No `enum`. No test framework, so types, Zod, and `yarn lint:docs` are the safety net.

## Comments and commits

- Comments are sparse and short, for non-obvious reasons only.
- Commits: imperative, capitalised, no prefix, no trailing period ("Fix live stream sync drift loops").

## Deviations

- `useLiveEvents` and `useInternationalStreamMedia` use `useState<Response>` in place of a reducer.
- Component hooks are sometimes `Foo.hooks.ts` and sometimes a `hooks/` folder.
- `useUserOffests` and `useRacesDetails.types.ts` have typos in their names that stuck. Keep them consistent rather than partly renaming.
