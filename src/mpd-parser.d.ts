declare module "mpd-parser" {
  export interface MPDManifest {
    allowCache: boolean;
    contentSteering: {
      defaultServiceLocation: string;
      proxyServerURL: string;
      queryBeforeStart: boolean;
      serverURL: string;
    };
    endList: boolean;
    mediaSequence: number;
    discontinuitySequence: number;
    playlistType: string;
    playlists: [
      {
        attributes: Record<string, unknown>;
      },
    ];
    mediaGroups: {
      AUDIO: {
        audio: {
          [groupId: string]: {
            default: boolean;
            autoselect: boolean;
            language: string;
            uri: string;
            instreamId: string;
            characteristics: string;
            forced: boolean;
          };
        };
      };
      VIDEO: Record<string, unknown>;
      "CLOSED-CAPTIONS": Record<string, unknown>;
      SUBTITLES: Record<string, unknown>;
    };
    dateTimeString: string;
    dateTimeObject: Date;
    targetDuration: number;
    totalDuration: number;
    discontinuityStarts: [number];
    segments: [
      {
        byterange: {
          length: number;
          offset: number;
        };
        duration: number;
        attributes: Record<string, unknown>;
        discontinuity: number;
        uri: string;
        timeline: number;
        key: {
          method: string;
          uri: string;
          iv: string;
        };
        map: {
          uri: string;
          byterange: {
            length: number;
            offset: number;
          };
        };
        "cue-out": string;
        "cue-out-cont": string;
        "cue-in": string;
      },
    ];
  }

  export interface MPDParserOptions {
    manifestUri?: string;
    eventHandler?: ({ type: string, message: string }) => void;
    previousManifest?: MPDManifest;
  }

  /*
   * Given a DASH manifest string and options, parses the DASH manifest into an object in the
   * form outputed by m3u8-parser and accepted by videojs/http-streaming.
   *
   * For live DASH manifests, if `previousManifest` is provided in options, then the newly
   * parsed DASH manifest will have its media sequence and discontinuity sequence values
   * updated to reflect its position relative to the prior manifest.
   *
   * @param {string} manifestString - the DASH manifest as a string
   * @param {options} [options] - any options
   *
   * @return {Object} the manifest object
   */
  export function parse(manifestString: string, options?: MPDParserOptions): MPDManifest;
}
