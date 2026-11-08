# Important code paths

Traces through the code that matters most. Hard rules are in the [root AGENTS.md](../AGENTS.md#hard-invariants).

## Boot

`src/main.tsx` calls `setupPostHog`, then renders `src/App.tsx`:

1. `AnalyticsContextProvider`, then `ErrorBoundary`, then `App`.
2. `App` runs `useHotkeysExecutor` and `useLoggedInStateExecutor`, and preloads the viewer chunk.
3. `ThemeProvider`, `BrowserRouter`, `FeatureFlagsWrapper` (`data-ff-*` attributes), `Routes`, then the overlays container and `SnackbarsList`.

No `StrictMode`.

## Authentication through the extension

The page never sees a password. It talks to the extension over `postMessage` (`src/utils/extensionApi.ts`). See [extension/AGENTS.md](../extension/AGENTS.md) for the extension side.

1. **Detection:** `src/hooks/useHasCompanion.ts` asks for the version, with a short timeout. No answer shows `NoCompanion`.
2. **State:** `src/hooks/useLoggedInState.ts` requests the token state and subscribes to `LOGGED_IN_CHANGED`.
3. **Login:** `src/views/LogIn/LogIn.tsx` requests login. The extension opens formula1.com and watches the `login-session` cookie.
4. **Requests:** the extension's declarative rules add the auth header and CORS headers. `fetchJSON` doesn't handle auth.

## Race list

`src/views/Races/Races.tsx` → `src/hooks/useRacesList/useRacesList.ts` loads all seasons from `SEASON_TO_F1_ID_MAP` (`src/constants/seasons.ts`) in parallel. Clicking a card opens a [Sheet](../src/components/Sheet/AGENTS.md) with `RaceDetails` (`src/hooks/useRaceDetails/`). Single-event cards are plain anchors.

## Race to playback

1. `src/views/Viewer/ViewerWithState.tsx` → `src/hooks/useVideoRaceDetails/useVideoRaceDetails.ts` fetches content.
2. `collectStreams` picks a source: `collectStreams.new.ts` for per-channel TME URLs with an entitlement token and licence URL; `collectStreams.old.ts` as a fallback.
3. A tier gate (`src/utils/canAccessEvent.ts`) shows `NoViewerAccess` where needed.
4. `src/views/Viewer/Viewer.tsx` renders windows. Each resolves a URL through `src/hooks/useStreamVideo/useStreamVideo.ts`.
5. `src/components/VideoPlayer/VideoPlayer.tsx` creates Shaka, configures it, and loads. `configureDrm` resets filters and servers and sets the Widevine licence URL and `entitlementtoken` header.
6. `src/views/Viewer/hooks/useStaggeredLoad.tsx` loads the main window first and staggers the rest.

## Multi-window sync

`src/views/Viewer/hooks/useSyncVideos.ts`. Thresholds are the constants at the top of the file.

- The main window is master. A `requestVideoFrameCallback` loop records its time and, for live, its distance from the seek range end.
- Each other window runs a loop that computes a target, ignores small drift, corrects moderate drift through playback rate, and hard seeks large drift.
- Buffering minions are skipped.
- `forceSync` runs on master seeks, offset changes, and tab visibility. It seeks directly because frame callbacks don't fire on paused videos.
- Offsets stack: manifest offset if large enough (`src/hooks/useManifestOffsets/`), otherwise F1 `playbackOffsets`, plus the user's per-window offset.

## Layouts and window dragging

- State: `useViewerState` under `src/views/Viewer/hooks/`, a reducer whose `withLocalStorage` wrapper persists on every dispatch.
- `src/components/RnDWindow/RnDWindow.tsx` converts percentages to pixels. Hooks in `src/components/RnDWindow/hooks/` mutate DOM styles during the gesture, and the dimension is dispatched on mouseup.
- Snapping: `src/views/Viewer/hooks/useGrid.ts`.
- To keep video from reloading, windows are memoised and references reused. See the invariant in root.

## Hotkeys

`src/hooks/useHotkeys/useHotkeys.tsx`, keys in `src/hooks/useHotkeys/useHotkeys.keys.tsx`.

- `useHotkeys` registers a scope; `useHotkeysExecutor` runs one `keydown` listener.
- Scopes are scanned newest first. Every matching hotkey in a scope fires.
- A scope with `allowPropagation: false` stops lower scopes for every key, matched or not.
- Modifiers must match exactly.

Add new shortcuts to `SHORTCUTS` and to `src/components/ShortcutsSnackbar/ShortcutsSnackbar.constant.ts`.

## Analytics

`src/utils/setupPostHog.ts` starts opted out with no autocapture. Consent and identify live in `src/hooks/useAnalytics/useAnalytics.tsx`. The custom event is `video_impression`, from `VideoPlayer`.

## localStorage

All through `LocalStorageClient` except for a few debug and boot cases.

| Key | Contents |
|---|---|
| `store` | Layouts |
| `flags` | Feature flags |
| `theme` | Theme |
| `wasConsentGiven` | Analytics consent |
| `canUseCmd` | Pro tip dismissed |
| `offsets_<raceId>` | User stream offsets |
