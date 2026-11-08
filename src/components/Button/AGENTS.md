# Button

## Usage

The control for every action and most links, in four emphasis levels. Use `Primary` once per area for the main action, `Secondary` for alternatives, `SecondaryInverted` over video, and `Tertiary` for low-emphasis actions such as toolbars. For rows in a list or menu use [ListItem](../ListItem/AGENTS.md).

## Import

```ts
import { Button } from "../Button/Button";
```

## Props

<!-- props: src/components/Button/Button.tsx#ButtonProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `children` | `ReactNode` | | Omit for icon-only |
| `variant` | `"Primary" \| "Secondary" \| "SecondaryInverted" \| "Tertiary"` | `"Primary"` | |
| `size` | `"Default" \| "Action"` | `"Default"` | `Action` for buttons inside snackbars |
| `fluid` | `boolean` | `false` | Fills the container |
| `disabledState` | `boolean` | `false` | Looks disabled, stays focusable |
| `isPressed` | `boolean` | `false` | Pressed look, e.g. while its dropdown is open |
| `iconLeft` | `IconComponent \| null` | | Rendered 20x20 |
| `iconRight` | `IconComponent \| null` | | Rendered 20x20 |

Everything else comes from the `as` element.

## Contracts

- [Polymorphic family](../../../docs/families/polymorphic.md)

## Do

- Give icon-only buttons an `aria-label`. Nothing enforces this.
- Use `disabled` when the action is plainly unavailable.
- Use `disabledState` under a [Tooltip](../Tooltip/AGENTS.md) that explains why, since a `disabled` button can't be hovered or focused.
- Pass [Spinner](../Spinner/AGENTS.md) as an icon for in-progress states.

## Don't

- Don't rely on `disabledState` to block clicks. It doesn't, so guard `onClick` yourself.
- Don't render a real button inside a link. Use `as="div"`.
- Don't leave `type` unset inside a form unless the button should submit.
- Don't pass an icon as children. Use `iconLeft` or `iconRight`, which fix the size at 20x20.

## Examples

```tsx
// from: src/components/Snackbar/Snackbar.tsx
<Button variant="Tertiary" iconLeft={XMarkIcon} onClick={onClose} aria-label="Close" />
```

```tsx
// from: src/components/NoViewerAccess/NoViewerAccess.tsx
<Button fluid variant="Secondary" as={Link} to="/">
  Go back
</Button>
```

```tsx
// from: src/components/Player/LayoutButtons/LayoutButtons.tsx
import { Tooltip } from "../Tooltip/Tooltip";

<Tooltip content={hasUsedAllStreams && "There are no more streams available"} delayDuration={300}>
  <Button
    iconLeft={PlusCircleIcon}
    variant="Secondary"
    onClick={hasUsedAllStreams ? undefined : onAddClick}
    disabledState={hasUsedAllStreams}
  >
    Add video
  </Button>
</Tooltip>
```

## Known gaps

- [KI-icon-only-buttons-unnamed](../../../docs/known-issues.md#ki-icon-only-buttons-unnamed-confirmed)
- [KI-aria-semantics-missing](../../../docs/known-issues.md#ki-aria-semantics-missing-confirmed)
