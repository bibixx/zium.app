const HOURS_IN_MS = 3600000;
const MINUTES_IN_MS = 60000;
const SECONDS_IN_MS = 1000;

export const parseTimeOffset = (time: string) => {
  const [h, m, s, ms] = time.split(/[:.]/).map(Number);
  return h * HOURS_IN_MS + m * MINUTES_IN_MS + s * SECONDS_IN_MS + ms;
};
