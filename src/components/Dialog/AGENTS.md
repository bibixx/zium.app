# Dialog

## Usage

Centred modal for a decision or short form. For lists and pickers use [Sheet](../Sheet/AGENTS.md); for a few actions on a trigger use [Dropdown](../Dropdown/AGENTS.md). See the [overlays family](../../../docs/families/overlays.md) for how to choose.

## Import

```ts
import { Dialog } from "../Dialog/Dialog";
import {
  DialogContent,
  DialogContentAlert,
  DialogContentButtonFooter,
  DialogContentCustom,
  DialogContentInformation,
} from "../Dialog/DialogContent/DialogContent";
```

## Anatomy

| Part | Required | Purpose |
|---|---|---|
| `Dialog` | Yes | Portal, backdrop, focus trap, transitions |
| `DialogContent` | Yes | Padded body; polymorphic, can be a `form` |
| `DialogContentInformation` | One of three | Neutral icon, title, subtitle |
| `DialogContentAlert` | One of three | Alert-styled icon, title, subtitle |
| `DialogContentCustom` | One of three | Title with free-form children |
| `DialogContentButtonFooter` | Optional | Button row |

The `DialogContent` parts also work outside a dialog for inline messages, as in `ErrorMessage` and `NoViewerAccess`.

## Props

### Dialog

<!-- props: src/components/Dialog/Dialog.tsx#DialogProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `children` | `ReactNode` | | Must contain a tabbable element |
| `isOpen` | `boolean` | | |
| `width` | `number \| string` | `"auto"` | Numbers become px |
| `onClose` | `() => void` | | Backdrop click |
| `onClosed` | `() => void` | | After the exit transition |
| `initialFocus` | `boolean` | `false` | Moves focus inside on open |

### DialogContent

<!-- props: src/components/Dialog/DialogContent/DialogContent.tsx#DialogContentProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `children` | `ReactNode` | | |
| `maxWidth` | `number` | | |

### DialogContentInformation

<!-- props: src/components/Dialog/DialogContent/DialogContent.tsx#DialogContentInformationProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `title` | `string` | | Rendered as `h2` |
| `subtitle` | `ReactNode` | | |
| `icon` | `typeof InformationCircleIcon` | `ExclamationTriangleIcon` | |

### DialogContentAlert

<!-- props: src/components/Dialog/DialogContent/DialogContent.tsx#DialogContentAlertProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `title` | `string` | | Rendered as `h2` |
| `subtitle` | `ReactNode` | | |
| `icon` | `typeof ExclamationTriangleIcon` | `ExclamationTriangleIcon` | |

### DialogContentCustom

<!-- props: src/components/Dialog/DialogContent/DialogContent.tsx#DialogContentCustomProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `title` | `string` | | Rendered as `h2` |
| `children` | `ReactNode` | | |

### DialogContentButtonFooter

<!-- props: src/components/Dialog/DialogContent/DialogContent.tsx#DialogContentButtonFooterProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `children` | `ReactNode` | | |

## Contracts

- [Overlays family](../../../docs/families/overlays.md)
- [Polymorphic family](../../../docs/families/polymorphic.md), for `DialogContent`

## Do

- Bind `SHORTCUTS.CLOSE` in the consumer.
- Use `as="form"` on `DialogContent` for dialogs with fields, with `type="button"` on Cancel.
- Set a numeric `width`; existing dialogs use 400.

## Don't

- Don't open a dialog with no tabbable content, because the focus trap throws. Add a [Button](../Button/AGENTS.md).
- Don't clear the content's data when closing. Clear it in `onClosed` so the exit animation still has content.

## Examples

```tsx
// from: src/components/Player/LayoutDialogs/LayoutDialogs.tsx
<Dialog isOpen={isOpen} onClose={onClose} onClosed={() => resetLaggedState()} width={400}>
  {dialogContent}
</Dialog>
```

```tsx
// from: src/components/Player/LayoutDialogs/LayoutDialogs.tsx
import { Input } from "../Input/Input";
import { Button } from "../Button/Button";

<DialogContent<"form">
  as="form"
  onSubmit={(e) => {
    e.preventDefault();
    internalOnSave();
  }}
>
  <DialogContentCustom title={title}>
    <Input autoFocus value={newNameValue} placeholder="Layout name" onChange={(value) => setNewNameValue(value)} />
  </DialogContentCustom>
  <DialogContentButtonFooter>
    <Button fluid variant="Secondary" onClick={onCancel} type="button">
      Cancel
    </Button>
    <Button fluid variant="Primary" disabled={isDisabled} type="submit">
      {onSaveText}
    </Button>
  </DialogContentButtonFooter>
</DialogContent>
```

```tsx
// from: src/components/NoViewerAccess/NoViewerAccess.tsx
<DialogContentAlert title={title} subtitle={subtitle} icon={XCircleIcon} />
```

## Known gaps

See the [overlays family](../../../docs/families/overlays.md#known-gaps).
