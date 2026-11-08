# Features

What zium does for a user. Requires an F1 TV subscription and the companion Chrome extension.

## Routes

Defined in `src/App.tsx`.

| Path | View | Gate |
|---|---|---|
| `/` | `Races` | Extension installed, logged in |
| `/race/:raceId` | `ViewerWithState` | Extension installed, logged in, tier |
| `/privacy-policy` | `PrivacyPolicy` | None |

Unsupported browsers (no "Chrome" in the user agent) get `NotSupported` at `/`. `/race/__DEBUG__` plays a debug stream.

## Onboarding

Steps: install the extension (`NoCompanion`), then log in to formula1.com (`LogIn`). Tier gating is in `src/utils/canAccessEvent.ts`: Access watches Access content, and Pro, Premium and Unknown watch everything.

## Browsing

- Seasons listed in `src/constants/seasons.ts`, with a scroll-spy sidebar.
- Future rounds are hidden except the next one.
- Search matches title, description, country and date, ignoring diacritics; `/` focuses it.
- Hero card in live, upcoming or replay state. "Remind me" uses extension alarms and Chrome notifications.
- A sheet lists each weekend's sessions and additional shows.

## Viewer

**Window types:** main (F1 Live or International), driver onboard, driver tracker, data channel, live timing tower (behind `showLiveTiming`, replay only).

**Windows:** drag, resize from 8 handles, grid snapping (Shift for half grid, Cmd/Ctrl for freeform), fit or fill, bring to front.

**Layouts:** defaults plus duplicate, rename, delete. Alt+digit switches. Holding Alt opens the menu with hints.

**Stream picker:** a sheet with search and arrow keys. Picking a driver already on screen swaps the two windows.

**Sync:** windows follow the main stream, with per-race, per-stream offsets.

**Live:** autoplay, a live indicator on the seekbar, go-to-live.

**Audio:** one focused window, volume and mute, team radio preference, international language menu.

**Captions:** main window only.

**Fullscreen:** `f` or double-click, using keyboard lock so Esc stays available to the app.

**UI:** auto-hiding controls, a draggable and collapsible player bar.

**Notifications:** "Now LIVE" snackbar when a session starts, "Pro tip" for snapping.

## Shortcuts

Defined in `src/hooks/useHotkeys/useHotkeys.keys.tsx` and listed in the app's shortcuts sheet.

## Debug panel

`Ctrl+Shift+D`, inside the logged-in gate (`src/components/DebugPanel/DebugPanel.tsx`): sync monitor, clear storage, reset flags, trigger an error, theme buttons, test snackbars, debug stream.

## Feature flags

`src/hooks/useFeatureFlags/`, toggled in the debug panel: `forceUiVisibility`, `forceTVAccess`, `increaseBackgroundContrast`, `showWindowBorders`, `disableLiveNotifications`, `showLiveTiming`.
