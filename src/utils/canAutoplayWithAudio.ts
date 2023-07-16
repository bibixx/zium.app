export function canAutoplayWithAudio() {
  return new AudioContext().state !== "suspended";
}
