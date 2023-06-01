export class StreamVideoError extends Error {
  constructor(public type: "NO_PLAYBACK_URL") {
    super(type);
  }
}
