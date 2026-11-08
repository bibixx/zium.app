# Known issues

The only home for bugs and gaps. Other docs link here and describe intended use.

- **Confirmed:** verified by reading the source. Not necessarily reproduced at runtime.
- **Suspected:** inferred from the code and needs reproducing before anyone relies on it.
- Don't fix these in passing. A fix is its own change and deletes the entry in the same commit.

## Input and hotkeys

### KI-hotkeys-form-tag-guard (Confirmed)

- **Where:** `isEventOnFormTag` in `src/hooks/useHotkeys/useHotkeys.tsx`
- **Actual:** compares `tagName` with lowercase names, but HTML `tagName` is uppercase. The guard never matches, so every hotkey fires while typing and `enableOnFormTags` has no effect.
- **Intended:** hotkeys skip form fields unless `enableOnFormTags: true`.
- **Likely effects:** `/` can't be typed in race search; `f`, `m`, `c` can fire while naming a layout.

### KI-hotkeys-scope-order (Suspected)

- **Where:** `useHotkeys` in `src/hooks/useHotkeys/useHotkeys.tsx`
- **Actual:** cleanup deletes a scope and the upsert appends it, so re-registering moves it to the top. Priority is "last re-registered".
- **Intended:** unknown. The original docs said "later registered wins".

### KI-shortcut-labels (Confirmed)

- **Where:** `src/components/ShortcutsSnackbar/ShortcutsSnackbar.constant.ts`
- **Actual:** "Skip forward/backward 10s" keys skip 1s (`src/views/Viewer/hooks/useGlobalShortcuts.ts`). "Decrease offset 1s" lists `OFFSET_INPUT_INCREASE_BIG`. "Open layouts" (`SHORTCUTS.OPEN_LAYOUTS`) runs `onAddClick` in `LayoutButtons`, which opens the stream picker.
- **Intended:** labels match behaviour.

## Accessibility

### KI-input-clear-aria-hidden (Confirmed)

- **Where:** clear button in `src/components/Input/Input.tsx`
- **Actual:** `aria-hidden={!isInputEmpty}` hides the button from assistive tech exactly when it is visible.
- **Intended:** exposed when visible, with an accessible name (it has none).

### KI-input-clear-button (Confirmed)

- **Where:** clear button in `src/components/Input/Input.tsx`
- **Actual:** no `type`, so it submits an enclosing form. Clearing doesn't refocus when the caller passes a callback ref.
- **Intended:** `type="button"` and focus returns in every case.

### KI-input-unnamed (Confirmed)

- **Where:** `src/components/Input/Input.tsx`
- **Actual:** the wrapping `<label>` has no text and no call site passes `aria-label`, so the placeholder is the only name.
- **Intended:** every field has an accessible name.

### KI-icon-only-buttons-unnamed (Confirmed)

- **Where:** layout menu trigger in `src/components/Player/LayoutButtons/LayoutButtons.tsx`; icon buttons in `src/components/VideoWindow/OffsetInput/OffsetInput.tsx`
- **Actual:** icon-only `Button`s with no `aria-label`.
- **Intended:** see the naming rule in [Button](../src/components/Button/AGENTS.md).

### KI-aria-semantics-missing (Confirmed)

- **Where:** `Dialog`, `Sheet`, `Dropdown`, `ListItem`, `Button`, `Snackbar`
- **Actual:** no `role="dialog"` or `aria-modal`, no menu roles or `aria-expanded`, `isActive` and `isPressed` are visual only, snackbars have no live region.
- **Intended:** state and roles reach assistive tech.

### KI-slider-mouse-only (Confirmed)

- **Where:** `src/components/Slider/Slider.tsx`
- **Actual:** mouse events only: no keyboard, touch, or `role="slider"`. Keyboard volume is added separately by `OptionsButtons`.
- **Intended:** unknown; the seekbar has hotkeys, the control itself doesn't.

### KI-reduced-motion (Confirmed)

- **Where:** `prefers-reduced-motion` appears only in `src/components/Snackbar/Snackbar.module.scss`
- **Actual:** every other transition and spring ignores the preference.
- **Intended:** motion respects the preference across the app.

### KI-spinner-loader-unannounced (Confirmed)

- **Where:** `src/components/Spinner/Spinner.tsx`, `src/components/Loader/Loader.tsx`
- **Actual:** neither exposes a label or status to assistive tech.
- **Intended:** loading states are announced.

### KI-logo-onboarding-unnamed (Confirmed)

- **Where:** `<Logo>` in `src/components/OnboardingLayout/OnboardingLayout.tsx`
- **Actual:** neither `aria-label` nor `aria-hidden`.
- **Intended:** see [Logo](../src/components/Logo/AGENTS.md).

## Overlays

### KI-body-scroll-lock (Confirmed)

- **Where:** the `isOpen` effect in `src/components/Dialog/Dialog.tsx` and `src/components/Sheet/Sheet.tsx`
- **Actual:** no cleanup on unmount and no counting across overlays, so unmounting while open leaves the page locked and closing one of two overlays unlocks both.
- **Intended:** the lock is released when the last overlay goes away.

### KI-nested-overlay-escape (Suspected)

- **Where:** clear-storage dialog in `src/components/DebugPanel/DebugPanel.tsx`
- **Actual:** only the parent binds `SHORTCUTS.CLOSE`, so Esc closes the panel and not the nested dialog.
- **Intended:** Esc closes the topmost overlay.

## Data and networking

### KI-abort-reported-as-error (Confirmed)

- **Where:** data hooks such as `src/hooks/useRaceDetails/useRaceDetails.ts`; `fetchJSON` in `src/utils/api.ts`
- **Actual:** only `src/hooks/useImage/useImage.tsx` filters aborts. Elsewhere an aborted request reaches the error state and `posthog.captureException`. `fetchJSON` wraps it in `ApiError`, losing the `AbortError` name, so a name check on its errors would fail.
- **Intended:** cancelled requests are neither shown nor reported.

### KI-fetchjson-no-res-ok (Confirmed)

- **Where:** `fetchJSON` in `src/utils/api.ts`
- **Actual:** `res.ok` is never checked, so HTTP errors with JSON bodies surface as Zod failures.
- **Intended:** HTTP failures surface as `ApiError`.

### KI-image-url-brace (Confirmed)

- **Where:** `src/hooks/useFormulaImage/useFormulaImage.tsx`
- **Actual:** the URL template contains `/${variant}}`, adding a stray `}`.
- **Intended:** no stray character. Check the image service's response before changing it.

### KI-sync-source-change (Suspected)

- **Where:** `src/views/Viewer/hooks/useSyncVideos.ts`
- **Actual:** the effect is keyed on window IDs. A source change under the same ID can keep stale offsets, and a remounted `<video>` may not get its frame callbacks re-armed.
- **Intended:** sync follows source changes.

## Extension

### KI-create-alarm-wipes-store (Confirmed)

- **Where:** `createAlarm` in `extension/src/background.ts`
- **Actual:** removes the whole alarm store before adding, so only the newest alarm can notify.
- **Intended:** several reminders coexist.

### KI-extension-unresolved-messages (Suspected)

- **Where:** `extension/src/content-script-zium.ts`
- **Actual:** login, logout and alarm promises never resolve because responses aren't relayed. Callers don't await them today.
- **Intended:** unknown.

### KI-extension-logout-header-rules (Suspected)

- **Where:** `login-session` cookie listener in `extension/src/background.ts`
- **Actual:** removing the cookie doesn't clear the header rules.
- **Intended:** logout removes the token from outgoing requests.
