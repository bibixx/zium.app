# Polymorphic family

Shared contract for components built with `withAs` (`src/utils/withAs.tsx`), which accept an `as` prop and take on that element's props and ref.

**Members:** [Button](../../src/components/Button/AGENTS.md), [ListItem](../../src/components/ListItem/AGENTS.md) and `ListItemWrapper`, `DialogContent`, `EventCard`.

**Excluded:** [WithVariables](../../src/components/WithVariables/AGENTS.md) has its own `as` prop without the typing.

## Contract

**Pick the element that matches the behaviour.**

| Behaviour | `as` |
|---|---|
| In-app navigation | `Link` from `react-router-dom`, with `to` |
| External link or full page load | `"a"`, with `href` |
| Action | leave the default |
| Inert, or inside another interactive element | `"div"` |

**Nesting.** A link can't contain a button, so a button inside a clickable card uses `as="div"`, as in `src/components/HeaderCard/HeaderCard.tsx`.

**Forms.** Native buttons default to `type="submit"`. Pass `type="button"` to any button in a form that shouldn't submit it.

**Conditional elements.** When `as` is chosen at runtime, spread `as const` props and name the union, as `RaceDetails` does:

```ts
const props = isDisabled ? ({ as: "div" } as const) : ({ as: Link, to: `/race/${raceDetails.id}` } as const);
// <ListItem<"div" | typeof Link> disabled={isDisabled} {...props}>
```

**Forms as containers.** `<DialogContent<"form"> as="form">` gives `onSubmit` a correctly typed event.

## Adding a member

```ts
export const Thing = withAs("button")<ThingProps>(({ as: Component, children, className, ...props }, ref) => (
  <Component className={cn(styles.thing, className)} ref={ref} {...props}>
    {children}
  </Component>
));
```

`ThingProps` lists only the component's own props. Element props come from `as`.
