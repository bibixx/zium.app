# Slider

## Usage

Horizontal scrub track on a 0 to 100 scale, with an optional buffer level and hover label. Use it for playback position and volume.

## Import

```ts
import { Slider } from "../Slider/Slider";
```

## Props

<!-- props: src/components/Slider/Slider.tsx#SliderProps -->
| Prop | Type | Default | Note |
|---|---|---|---|
| `value` | `number` | | 0 to 100 |
| `onValueChange` | `(value: number) => void` | | Called on press and while scrubbing |
| `onScrubStart` | `() => void` | | |
| `onScrubEnd` | `() => void` | | |
| `onHoveringStart` | `() => void` | | |
| `onHoveringEnd` | `() => void` | | |
| `onSeekPositionChange` | `(fraction: number) => void` | | 0 to 1, unlike `value` |
| `bufferLevel` | `number` | | 0 to 100; omit to hide |
| `disabled` | `boolean` | `false` | Blocks pointer input through CSS |
| `accentTrack` | `boolean` | `false` | Keeps the marker and hover styling on |
| `renderLabel` | `(seekPosition: number) => ReactNode` | | Label above the cursor; receives 0 to 100 |
| `className` | `string` | | |

## Do

- Convert your domain value to 0 to 100 before passing it, as `Seekbar` does for playback time.
- Pair it with a hotkey or other keyboard path, since the control itself is mouse only.

## Don't

- Don't pass raw seconds or a 0 to 1 volume. Convert them first.

## Examples

```tsx
// from: src/components/Player/PlayerControls/Seekbar/Seekbar.tsx
<Slider
  value={playbackPosition}
  onValueChange={onValueChange}
  onScrubStart={onScrubStart}
  onScrubEnd={onScrubEnd}
  onSeekPositionChange={onSeekPositionChange}
  bufferLevel={bufferLevel}
  disabled={!isReady}
  renderLabel={renderLabel}
  className={styles.seekbar}
/>
```

```tsx
// from: src/components/Player/PlayerControls/OptionsButtons/VolumeSlider.tsx
<Slider value={volume} onValueChange={onValueChange} accentTrack renderLabel={renderLabel} />
```

## Known gaps

- [KI-slider-mouse-only](../../../docs/known-issues.md#ki-slider-mouse-only-confirmed)
