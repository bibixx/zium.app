# ListItem

## Usage

Full-width selectable row with a right-aligned caption. Use it for navigation lists and menu rows. Use `ListItemWrapper` directly when a row needs custom content instead of text plus caption. For standalone actions use [Button](../Button/AGENTS.md).

## Import

```ts
import { ListItem } from "../ListItem/ListItem";
import { ListItemWrapper } from "../ListItem/ListItemWrapper/ListItemWrapper";
```

## Anatomy

| Part | Required | Purpose |
|---|---|---|
| `ListItemWrapper` | Yes | Row surface and hover, active, disabled states |
| Text | Yes | `children` |
| Caption | Optional | Right-aligned muted detail |

## Props

### ListItem

<!-- props: src/components/ListItem/ListItem.tsx#ListItemProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `children` | `ReactNode` | | |
| `caption` | `ReactNode` | | |
| `isActive` | `boolean` | `false` | Filled, raised style; visual only |
| `disabled` | `boolean` | | |

### ListItemWrapper

<!-- props: src/components/ListItem/ListItemWrapper/ListItemWrapper.tsx#ListItemWrapperProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `children` | `ReactNode` | | |
| `isActive` | `boolean` | `false` | |
| `disabled` | `boolean` | | |
| `className` | `string` | | |

## Contracts

- [Polymorphic family](../../../docs/families/polymorphic.md)

## Do

- Use `as={Link}` for in-app navigation and `as="a"` for anchors.
- Use `as="div"` with `disabled` for inert rows such as loading placeholders.

## Don't

- Don't rely on `isActive` to tell assistive tech what's selected. Add `aria-current` where it matters.

## Examples

```tsx
// from: src/views/Races/RaceDetails/AdditionalEvents/AdditionalEvents.tsx
<ListItem key={raceDetails.id} as={Link} to={`/race/${raceDetails.id}`}>
  {raceDetails.title}
</ListItem>
```

```tsx
// from: src/views/Races/Sidebar/Sidebar.tsx
<ListItem as="a" href={`#season-${season}`} caption={count} disabled={count === 0} isActive={isActive} onClick={onSidebarElementClick}>
  <div>Season {season}</div>
</ListItem>
```

```tsx
// from: src/views/Races/RaceDetails/RaceDetails.tsx
<ListItem as="div" disabled>
  <span />
</ListItem>
```

## Known gaps

- [KI-aria-semantics-missing](../../../docs/known-issues.md#ki-aria-semantics-missing-confirmed)
