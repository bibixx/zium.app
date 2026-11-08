# Dropdown

## Usage

Menu anchored to a trigger through a render prop, with rows, captions and optional sections. Use `Dropdown` by default. Use `StatelessDropdown` when the parent must own the open state, such as opening the menu from a hotkey.

## Import

```ts
import { Dropdown, StatelessDropdown } from "../Dropdown/Dropdown";
```

The option types `DropdownOptions`, `DropdownSection` and `DropdownSectionElement` come from the same file.

## Anatomy

| Part | Required | Purpose |
|---|---|---|
| Trigger | Yes | Returned from `children`; must receive `setRef` |
| Options | Yes | Rendered as [ListItem](../ListItem/AGENTS.md) rows |
| Section divider | Optional | Automatic between sections |

## Props

### Dropdown and StatelessDropdown

`Dropdown` takes everything here except `isOpen`, `setIsOpen` and `toggleOpen`, which it manages.

<!-- props: src/components/Dropdown/Dropdown.tsx#StatelessDropdownProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `isOpen` | `boolean` | | |
| `setIsOpen` | `(isOpen: boolean) => void` | | |
| `toggleOpen` | `() => void` | | |
| `width` | `number` | `240` | |
| `distance` | `number` | `8` | Gap from the trigger |
| `skidding` | `number` | `0` | Offset along the trigger |
| `placement` | `Placement` | `"auto"` | Popper placement |
| `children` | `(props: DropdownChildrenProps) => JSX.Element` | | Receives `setRef`, `isOpen`, `toggleOpen` |
| `options` | `DropdownOptions \| ((toggleOpen: () => void) => DropdownOptions)` | | |
| `closeOnClick` | `boolean` | `false` | |

### Dropdown only

<!-- props: src/components/Dropdown/Dropdown.hooks.ts#UseDropdownStateArguments -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `onOpened` | `() => void` | | |
| `onClosed` | `() => void` | | |

## Contracts

- [Overlays family](../../../docs/families/overlays.md)

## Do

- Pass `setRef` to the trigger and `isOpen` to its `isPressed`.
- Use `false` entries for conditional options or sections.
- Call `e.preventDefault()` in an option's `onClick` to keep the menu open with `closeOnClick`.
- Keep the player UI visible while open, using `preventHiding` from `useViewerUIVisibility`.
- Bind `SHORTCUTS.CLOSE` yourself when using `StatelessDropdown`.

## Don't

- Don't mix sections and flat options in one array, because it throws. Wrap flat items in a section.
- Don't give a dropdown only disabled options, because the focus trap needs a tabbable element.
- Don't use it for long searchable lists. Use [Sheet](../Sheet/AGENTS.md).

## Examples

```tsx
// from: src/components/VideoWindow/VideoWindowButtons/VideoWindowButtons.tsx
import { Button } from "../Button/Button";

<Dropdown
  placement="top-end"
  options={availableClosedCaptions}
  onOpened={() => preventHiding(true)}
  onClosed={() => preventHiding(false)}
  closeOnClick
>
  {({ setRef, toggleOpen, isOpen }) => (
    <Button
      ref={setRef}
      iconLeft={ClosedCaptionsOnIcon}
      isPressed={isOpen}
      variant="SecondaryInverted"
      onClick={toggleOpen}
      aria-label="Choose closed captions track"
    />
  )}
</Dropdown>
```

```tsx
// from: src/components/Player/LayoutButtons/LayoutButtons.tsx
import { Button } from "../Button/Button";

<StatelessDropdown placement="top-end" width={248} options={dropdownOptions} {...dropdownState}>
  {({ setRef, toggleOpen, isOpen }) => (
    <Button
      ref={setRef}
      iconLeft={RectangleGroupIcon}
      isPressed={isOpen}
      variant="Tertiary"
      onClick={toggleOpen}
      aria-label="Layouts"
    />
  )}
</StatelessDropdown>
```

The second sample adds the `aria-label` the call site is missing, see [KI-icon-only-buttons-unnamed](../../../docs/known-issues.md#ki-icon-only-buttons-unnamed-confirmed).

## Known gaps

See the [overlays family](../../../docs/families/overlays.md#known-gaps).
