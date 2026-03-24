import shaka from "shaka-player";

const EWMA_SLOW_WEIGHT = 0.7;
const EWMA_FAST_WEIGHT = 0.3;
const INITIAL_ESTIMATE_BPS = 1_000_000; // 1 Mbps

export const sharedBandwidthEstimate = { value: INITIAL_ESTIMATE_BPS };

let registered = false;

export function registerSharedBandwidthPlugin() {
  if (registered) return;
  registered = true;

  const originalPlugin = shaka.net.HttpFetchPlugin.parse;

  shaka.net.NetworkingEngine.registerScheme(
    "https",
    (uri, request, requestType, progressUpdated, headersReceived, config) => {
      const result = originalPlugin(uri, request, requestType, progressUpdated, headersReceived, config);

      result.promise.then(
        (response) => {
          const bytes = response.data?.byteLength ?? 0;
          const durationMs = response.timeMs ?? 0;

          if (durationMs > 0 && bytes > 0) {
            const bps = (bytes * 8 * 1000) / durationMs;
            sharedBandwidthEstimate.value = EWMA_SLOW_WEIGHT * sharedBandwidthEstimate.value + EWMA_FAST_WEIGHT * bps;
          }
        },
        () => {
          // Ignore aborted/failed requests — they don't contribute to bandwidth estimation
        },
      );

      return result;
    },
    shaka.net.NetworkingEngine.PluginPriority.APPLICATION,
  );
}
