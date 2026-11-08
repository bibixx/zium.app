# Spinner

## Usage

Small rotating SVG with the shape of an icon, used in place of an icon during in-progress actions. For a page-level wait use [Loader](../Loader/AGENTS.md).

## Import

```ts
import { Spinner } from "../Spinner/Spinner";
```

Takes SVG props.

## Do

- Pass it as the icon of a [Button](../Button/AGENTS.md).

## Don't

- Don't pass `className` to adjust it, because that replaces the class that makes it spin. Style a wrapper instead.

## Examples

```tsx
// from: src/views/LogIn/LogIn.tsx
import { Button } from "../Button/Button";

<Button iconLeft={!isOpening ? ArrowLeftOnRectangleIcon : Spinner} variant={isOpening ? "Secondary" : "Primary"} fluid>
  Log in to Formula1.com
</Button>
```

## Known gaps

- [KI-spinner-loader-unannounced](../../../docs/known-issues.md#ki-spinner-loader-unannounced-confirmed)
