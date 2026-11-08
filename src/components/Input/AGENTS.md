# Input

## Usage

Single-line text field with an optional leading icon, clear button, and shortcut hint. Use it for search and short names. Use `isRounded` for search in page chrome, and the default shape inside dialogs.

## Import

```ts
import { Input } from "../Input/Input";
```

## Props

<!-- props: src/components/Input/Input.tsx#InputProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `icon` | `IconComponent \| null` | | Leading icon |
| `isRounded` | `boolean` | `false` | Pill shape |
| `canClear` | `boolean` | `false` | Shows a clear button when non-empty |
| `onChange` | `(value: string, e?: React.ChangeEvent) => void` | | Value first, unlike the native signature |
| `shortcut` | `string` | | Display only, through [KeyIndicator](../KeyIndicator/AGENTS.md) |
| `labelClassName` | `string` | | Class on the wrapping label |

Other native `input` props pass through, and the ref reaches the `<input>`.

## Do

- Control it with `value`. The clear button's visibility is derived from `value`.
- Bind the matching hotkey yourself when passing `shortcut`, and focus the field through a ref.
- Pass `aria-label` when there is no visible label.

## Don't

- Don't write `onChange={(e) => e.target.value}`. The first argument is already the string.
- Don't expect `shortcut` to do anything on its own. Use `useHotkeys` for the behaviour.
- Don't pass a callback ref with `canClear` if focus should return after clearing. Use an object ref.

## Examples

```tsx
// from: src/views/Races/Header/Header.tsx
<Input
  isRounded
  placeholder="Search"
  icon={MagnifyingGlassIcon}
  value={searchQuery}
  onChange={(value) => setSearchQuery(value)}
  canClear
  ref={inputRef}
  shortcut="/"
/>
```

```tsx
// from: src/components/Player/LayoutDialogs/LayoutDialogs.tsx
<Input
  autoFocus
  value={newNameValue}
  placeholder="Layout name"
  onChange={(value) => setNewNameValue(value)}
  ref={inputRef}
/>
```

## Known gaps

- [KI-input-clear-aria-hidden](../../../docs/known-issues.md#ki-input-clear-aria-hidden-confirmed)
- [KI-input-clear-button](../../../docs/known-issues.md#ki-input-clear-button-confirmed)
- [KI-input-unnamed](../../../docs/known-issues.md#ki-input-unnamed-confirmed)
- [KI-hotkeys-form-tag-guard](../../../docs/known-issues.md#ki-hotkeys-form-tag-guard-confirmed)
