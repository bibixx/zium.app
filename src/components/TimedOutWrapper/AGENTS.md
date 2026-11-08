# TimedOutWrapper

## Usage

Hides its children until a delay passes, so loading states don't flash on fast responses.

## Import

```ts
import { TimedOutWrapper } from "../TimedOutWrapper/TimedOutWrapper";
```

## Props

<!-- props: src/components/TimedOutWrapper/TimedOutWrapper.tsx#TimedOutWrapperProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `transition` | `string` | | Overrides the reveal transition |
| `children` | `ReactNode` | | |
| `timeout` | `number` | | Milliseconds |

## Don't

- Don't wrap real content. It starts hidden even when ready, so use it only around loading placeholders.

## Examples

```tsx
// from: src/views/Races/Season/Season.tsx
<TimedOutWrapper timeout={100} key={i}>
  <EventCardSkeleton />
</TimedOutWrapper>
```
