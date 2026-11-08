# Overlays family

Shared contract for surfaces that portal above the page and trap focus.

**Members:** [Dialog](../../src/components/Dialog/AGENTS.md), [Sheet](../../src/components/Sheet/AGENTS.md), [Dropdown](../../src/components/Dropdown/AGENTS.md) (including `StatelessDropdown`).

**Excluded:** [Tooltip](../../src/components/Tooltip/AGENTS.md) (Radix portal to `body`, non-modal), [Snackbar](../../src/components/Snackbar/AGENTS.md) (rendered in place by `SnackbarsList`, non-modal).

## Choosing one

| Need | Use |
|---|---|
| A decision or short form that interrupts the task | Dialog |
| A list or picker the user browses, with the page still in view | Sheet |
| A short menu of actions anchored to a trigger | Dropdown |

## Contract

**Portal.** All three render into the element with id `OVERLAYS_PORTAL_ID` (`src/constants/portals.ts`), mounted once in `src/App.tsx`. They look it up on first render and throw if it's missing. That element is committed after the routes, so an overlay can't render during App's first synchronous render. Keep them behind an async gate such as `WithCompanion` or `WithLoggedIn`.

**Escape.** The focus trap has `escapeDeactivates: false` and the components bind no key, except `Dropdown`.

- `Dialog`, `Sheet`, `StatelessDropdown`: the consumer binds `SHORTCUTS.CLOSE` through `useHotkeys`, with `enabled: isOpen`.
- `Dropdown`: bound for you.
- Use `allowPropagation: false` when shortcuts behind the overlay shouldn't fire.
- Use `enableOnFormTags: true` when the overlay contains a field, so Esc still closes it.

**Focus.** `FocusTrap` with `allowOutsideClick: true`.

- `Dialog` and `Sheet` leave focus where it is unless `initialFocus` is passed. Pass it when the first control should receive focus, as `StreamPicker` does for its search field.
- `focus-trap` throws if the content has no tabbable element. `Sheet` always has its Close button. `Dialog` content must supply one, and a `Dropdown` needs one enabled option.
- `Dropdown` also maps Up and Down to focus movement.

**Dismissal.** Clicking the backdrop closes. Treat `onClose` as a request and let the parent set `isOpen`.

**Exit content.** `onClosed` fires after the exit transition. Content must stay rendered until then, so keep a lagged copy of the data and clear it in `onClosed`, as `resetLaggedState` does in `src/views/Races/Season/Season.tsx`.

**Transitions.** `CSSTransition` with `nodeRef`, `addEndListener`, `mountOnEnter`, `unmountOnExit`, and class names mapped to the CSS module. Copy this when adding a surface.

**Surface.** `pos-3dp` elevation and `--z-index-overlay`. Dialog and Sheet lock body scroll; Dropdown doesn't.

## Known gaps

- [KI-body-scroll-lock](../known-issues.md#ki-body-scroll-lock-confirmed)
- [KI-nested-overlay-escape](../known-issues.md#ki-nested-overlay-escape-suspected)
- [KI-aria-semantics-missing](../known-issues.md#ki-aria-semantics-missing-confirmed)
