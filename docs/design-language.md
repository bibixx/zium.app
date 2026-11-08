# Design language

What zium should feel like: a pit wall built by someone who watches a lot of F1. For the token mechanics see [design-system.md](design-system.md).

## Principles

**Video is the interface.** Windows run edge to edge with no gutters. Empty grid cells show black with a dot pattern, so the page reads as a workspace and not as a website.

**Chrome recedes.** Window chips and controls fade out when the pointer is idle (`useViewerUIVisibility`). Anything added to the viewer must hide with them, and call `preventHiding` while a menu is open.

**Black, neutral, one red.** The page is pure black with near-black raised surfaces. F1 red is scarce: the primary action, the active-season marker, live state, and the keyboard focus ring. If two things on screen are red and neither is one of those, one should change.

**Keyboard first.** Every viewer action has a shortcut, and hints are shown with `<kbd>`. Mouse-only features are gaps, not the design.

**Direct and physical.** Windows drag and resize in place. The player bar and snackbars use spring physics. Controls lift slightly on hover and settle on press.

## Surfaces

| Surface | Look |
|---|---|
| Player bar | Floating dark rounded panel inset from the bottom, with a drag tab, split by dividers into race info, transport, seekbar, and layout actions |
| Window chip | Pill over video with a round icon and an uppercase label (MAIN STREAM, DATA, TRACKER), on the `darken` interactive background |
| Sheet | 320px panel inset 8px from the right, with large radii, dimming the page |
| Dropdown | Compact panel anchored to its trigger, with rows, right-aligned muted counts, and a divider between groups |
| Race card | Image on top; below it a flag, title, date, and a right-aligned muted round number |
| Hero card | Large rounded card with a grayscale race image blurred into the surface |

## Content patterns

- **Two-tier text:** a strong title with muted detail beneath or beside it.
- **Uppercase is for display:** session names and chips use `heading … display`. Body text stays sentence case.
- **Driver names:** first name regular, surname bold uppercase.
- **Selected rows:** a lighter filled rounded row with a hairline ring (`pos-1dp`).
- **Loading:** skeletons and loaders appear only after a short delay ([TimedOutWrapper](../src/components/TimedOutWrapper/AGENTS.md)).
- **Tone:** short and plain, with some motorsport humour ("Box, box!" for empty search).

## Reference

- Figma: <https://www.figma.com/community/file/1250905585551204036/Zium.app>
