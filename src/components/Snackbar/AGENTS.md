# Snackbar

## Usage

Timed notification stack, dismissable by dragging right, opened from anywhere with `useSnackbars`. Use it for non-blocking news such as a session going live or a tip. For anything needing a decision before continuing use [Dialog](../Dialog/AGENTS.md).

## Import

```ts
import { useSnackbars } from "../Snackbar/SnackbarsList.hooks";
```

## Anatomy

| Part | Required | Purpose |
|---|---|---|
| `SnackbarsList` | Yes | Mounted once in `src/App.tsx`; don't render it again |
| `Snackbar` | Internal | Don't render it directly |
| Title | Yes | |
| Content, image, actions | Optional | |

## Props

`openSnackbar(data)` returns the id. `closeSnackbar(id)` removes one.

<!-- props: src/components/Snackbar/SnackbarsList.hooks.ts#ArgumentSnackbarData -->
| Field | Type | Default | Note |
|---|---|---|---|
| `id` | `string` | generated | Reusing an id replaces that snackbar in place |
| `title` | `ReactNode` | | |
| `content` | `ReactNode` | | |
| `actions` | `ReactNode` | | Buttons with `size="Action"` |
| `time` | `number` | `4000` | Milliseconds; `Infinity` disables the timer |
| `pictureConfig` | `PictureConfig` | | Image from the F1 image service |

## Do

- Pass a stable `id` for anything that could fire twice.
- Use `time: Infinity` when the snackbar has actions the user must choose between.
- Keep `size="Action"` and `fluid` on action buttons.

## Don't

- Don't queue many at once. Only the newest three are shown.
- Don't put essential information in a timed snackbar. It disappears after 4s unless hovered, so use [Dialog](../Dialog/AGENTS.md).

## Examples

```tsx
// from: src/views/Viewer/hooks/useCmdTutorial.tsx
const { openSnackbar } = useSnackbars();

openSnackbar({
  id: "pro-tip-cmd",
  title: "Pro tip",
  content: <span>To prevent snapping, hold down the command key while resizing.</span>,
});
```

```tsx
// from: src/views/Viewer/hooks/useNotifyAboutNewEvent/useNotifyAboutNewEvent.utils.tsx
import { Button } from "../Button/Button";

const { openSnackbar } = useSnackbars();

openSnackbar({
  title: "Now LIVE",
  content: `Tune in to watch the ${title}`,
  pictureConfig,
  actions: (
    <Button variant="Primary" size="Action" fluid as={Link} to={`/race/${latestEventId}`}>
      Watch live
    </Button>
  ),
  time: Infinity,
});
```

## Known gaps

- [KI-aria-semantics-missing](../../../docs/known-issues.md#ki-aria-semantics-missing-confirmed): no live region, and focus doesn't pause the timer.
