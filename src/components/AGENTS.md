# Components

Reusable UI. Check the atom table in the [root AGENTS.md](../../AGENTS.md) before adding anything.

## Adding a component

1. Create `<Name>/<Name>.tsx` and `<Name>.module.scss`. See [architecture](../../docs/architecture.md#files-and-naming).
2. Style with tokens and mixins from the [design system](../../docs/design-system.md).
3. If it renders as different elements, use `withAs` ([polymorphic family](../../docs/families/polymorphic.md)). If it's a modal surface, follow the [overlays family](../../docs/families/overlays.md).
4. If it's a reusable atom, add `<Name>/AGENTS.md` and a row in the root atom table.

## Writing an atom doc

Sections, in order, omitting empty ones: Usage, Import, Anatomy, Props, Contracts, Do, Don't, Examples, Known gaps.

- **Table sentence:** one present-tense sentence, at most 20 words: what it is, then what distinguishes it.
- **Usage:** when to use it and when to reach for something else.
- **Props:** own props only, preceded by a marker that names the source type:
  `<!-- props: src/components/Button/Button.tsx#ButtonProps -->`
- **Don't:** name the alternative or the reason.
- **Examples:** real, trimmed call sites. Start each with `// from: <path>`. Don't use a call site that has a known gap.
- **One owner per fact:** link to a family or known issue instead of copying it.

## Keeping docs current

- Change a contract and its doc in the same commit.
- `yarn lint:docs` runs in `yarn lint` and `yarn build`. It fails on a missing atom doc, a broken link or path, a Props table that differs from the source, or a sample that no longer type-checks.
- It can't judge whether prose is still true. Run the `docs-audit` skill after larger changes.
