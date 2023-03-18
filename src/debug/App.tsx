import { useEffect, useMemo, useRef, useState } from "react";
import { useStreamVideo } from "../hooks/useStreamVideo/useStreamVideo";
import { useVideoRaceDetails } from "../hooks/useVideoRaceDetails/useVideoRaceDetails";
import "bitmovin-player-ui/dist/css/bitmovinplayer-ui.min.css";
import { Player } from "bitmovin-player";
import { UIFactory } from 'bitmovin-player-ui';

import "./App.css";
import "../styles/bitmovin.scss";

interface Data {
  raceId: string;
  streamsCount: number;
  backend: "videojs" | "bitmovin";
}

const App = () => {
  const [data, setData] = useState<Data>({ raceId: "1000006433", streamsCount: 7, backend: "bitmovin" });

  return (
    <div>
      <div>
        <input type="text" value={data.raceId} onChange={(e) => setData((d) => ({ ...d, raceId: e.target.value }))} />
        <select
          value={data.backend}
          onChange={(e) => setData((d) => ({ ...d, backend: e.target.value as "videojs" | "bitmovin" }))}
        >
          <option value="videojs">videojs</option>
          <option value="bitmovin">bitmovin</option>
        </select>
        <input
          type="number"
          value={data.streamsCount}
          min="1"
          onChange={(e) => setData((d) => ({ ...d, streamsCount: e.target.valueAsNumber }))}
        />
      </div>
      <Viewer data={data} key={JSON.stringify(data)} />
    </div>
  );
};

interface ViewerProps {
  data: Data;
}
const Viewer = ({ data }: ViewerProps) => {
  const { raceId, streamsCount, backend } = data;
  const state = useVideoRaceDetails(raceId);
  const streams = useMemo(
    () =>
      state.state !== "done"
        ? []
        : [
            state.streams.defaultStream,
            state.streams.dataChannelStream,
            state.streams.driverTrackerStream,
            ...state.streams.driverStreams,
          ].slice(0, streamsCount),
    [state, streamsCount],
  );
  const VideoContainer = useMemo(() => (backend === "videojs" ? V : V2), [backend]);

  if (state.state !== "done") {
    return <div>Loading</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }} key={raceId}>
      {streams.map((stream) => stream && <VideoContainer streamUrl={stream.playbackUrl} key={stream.channelId} />)}
    </div>
  );
};

interface VProps {
  streamUrl: string;
}
const V = ({ streamUrl }: VProps) => {
  const streamVideoState = useStreamVideo(streamUrl);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const placeholderEl = placeholderRef.current;
    if (placeholderEl == null || streamVideoState.state !== "done") {
      return;
    }

    const $videoElement = document.createElement("video-js");
    placeholderEl.appendChild($videoElement);

    const sources =
      streamVideoState.data.streamType === "HLS"
        ? {
            src: streamVideoState.data.videoUrl,
            type: "application/x-mpegURL",
          }
        : {
            src: streamVideoState.data.videoUrl,
            type: "application/dash+xml",
            keySystems: {
              "com.widevine.alpha": {
                url: streamVideoState.data.laURL,
                audioRobustness: "SW_SECURE_CRYPTO",
                videoRobustness: "SW_SECURE_DECODE",
              },
            },
          };

    const options = {
      sources: sources,
      liveui: true,
      enableSourceset: true,
      fluid: true,
      html5: {
        vhs: {
          overrideNative: true,
          bufferBasedABR: false,
          llhls: true,
          exactManifestTimings: false,
          leastPixelDiffSelector: false,
          useNetworkInformationApi: false,
          useDtsForTimestampOffset: false,
        },
      },
      autoplay: true,
      muted: true,
      controls: true,
    };

    const player = videojs($videoElement, options);
    player.eme();
  }, [streamVideoState]);

  if (streamVideoState.state !== "done") {
    return <div>Loading</div>;
  }

  return <div ref={placeholderRef} />;
};

interface V2Props {
  streamUrl: string;
}
const V2 = ({ streamUrl }: V2Props) => {
  const streamVideoState = useStreamVideo(streamUrl);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const placeholderEl = placeholderRef.current;
    if (placeholderEl == null || streamVideoState.state !== "done") {
      return;
    }

    const playerConfig = {
      key: "<PLAYER_LICENSE_KEY>",
      playback: {
        muted: true,
        autoplay: true,
      },
    };
    const player = new Player(placeholderEl, playerConfig);
    UIFactory.buildDefaultUI(player);

    const sourceConfig =
      streamVideoState.data.streamType === "HLS"
        ? {
            hls: streamVideoState.data.videoUrl,
          }
        : {
            dash: streamVideoState.data.videoUrl,
            drm: {
              widevine: {
                LA_URL: streamVideoState.data.laURL,
              },
            },
          };

    player.load(sourceConfig);
  }, [streamVideoState]);

  if (streamVideoState.state !== "done") {
    return <div>Loading</div>;
  }

  return <div ref={placeholderRef} />;
};

export default App;
