# Loader

## Usage

Looping Lottie animation for a full-screen wait, today only while the viewer loads. For a wait inside a control use [Spinner](../Spinner/AGENTS.md).

## Import

```ts
import { Loader } from "../Loader/Loader";
```

## Props

<!-- props: src/components/Loader/Loader.tsx#LoaderProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `width` | `string \| number` | | Numbers become px |
| `height` | `string \| number` | | Numbers become px |

## Do

- Wrap it in [TimedOutWrapper](../TimedOutWrapper/AGENTS.md) so fast loads never flash it.

## Examples

```tsx
// from: src/views/Viewer/ViewerWithState.tsx
import { TimedOutWrapper } from "../TimedOutWrapper/TimedOutWrapper";

<TimedOutWrapper timeout={500}>
  <div className={styles.loaderWrapper}>
    <Loader width={64} />
  </div>
</TimedOutWrapper>
```

## Known gaps

- [KI-spinner-loader-unannounced](../../../docs/known-issues.md#ki-spinner-loader-unannounced-confirmed)
