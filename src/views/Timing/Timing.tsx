import { addMilliseconds, differenceInMilliseconds, differenceInSeconds, formatISO } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { TimingProvider, useLoadedTimingData, useTiming } from "../../hooks/useTiming/useTiming";
import { padStart } from "../../utils/padStart";
import { CarDataValue, getCarDataValue, getLatestUtc } from "../../utils/extractTimingDataUtils";

export const TimingWithState = () => (
  <TimingProvider>
    <Timing />
  </TimingProvider>
);

const Timing = () => {
  const isLoaded = useTiming((s) => s.state.data != null);
  const header = <TimeSlider key="TimeSlider" />;

  if (!isLoaded) {
    return <div>{header}</div>;
  }

  return (
    <div>
      {header}
      <Time />
      <Weather />
      <Positions />
    </div>
  );
};

const TimeSlider = () => {
  const range = useTiming((s) => s.state.dataRange);
  const currentTime = useTiming((s) => s.state.currentTime);
  const setCurrentTime = useTiming((s) => s.setCurrentTime);

  const currentTimeRef = useRef(currentTime);
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  const [localCurrentTime, setLocalCurrentTime] = useState(currentTime);
  const [isStarted, setIsStarted] = useState(false);
  useEffect(() => {
    if (isStarted) {
      const int = 100;
      const timeScale = 1;

      const interval = setInterval(() => {
        setLocalCurrentTime((prev) => prev + int * timeScale);
        setCurrentTime(currentTimeRef.current + int * timeScale);
      }, int);

      return () => clearInterval(interval);
    }
  }, [isStarted, setCurrentTime]);

  useEffect(() => {
    if (!isStarted) {
      setLocalCurrentTime(currentTime);
    }
  }, [isStarted, currentTime, setCurrentTime]);

  return (
    <header>
      <div>{JSON.stringify({ range, currentTime }, null, 2)}</div>
      <div>{new Date(localCurrentTime).toISOString()}</div>
      <input
        type="range"
        min={range?.start}
        max={range?.end}
        step={1000}
        value={localCurrentTime}
        onChange={(e) => setLocalCurrentTime(e.target.valueAsNumber)}
        onMouseUp={() => setCurrentTime(localCurrentTime)}
        onKeyUp={() => setCurrentTime(localCurrentTime)}
      />
      <button onClick={() => setIsStarted(!isStarted)}>{isStarted ? "Stop" : "Start"}</button>
    </header>
  );
};

const Weather = () => {
  const weatherData = useLoadedTimingData((s) => s.WeatherData);

  return (
    <table>
      <thead>
        <tr>
          <th>Air Temp</th>
          <th>Track Temp</th>
          <th>Humidity</th>
          <th>Rainfall</th>
          <th>Wind Speed</th>
          <th>Wind Direction</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{weatherData.AirTemp}</td>
          <td>{weatherData.TrackTemp}</td>
          <td>{weatherData.Humidity}</td>
          <td>{getRainfallText(weatherData.Rainfall)}</td>
          <td>{weatherData.WindSpeed}</td>
          <td>
            <span>{getWindDirection(weatherData.WindDirection)}</span>
            <span
              style={{
                display: "inline-block",
                transform: `rotate(${weatherData.WindDirection}deg)`,
              }}
            >
              ↑
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const Positions = () => {
  const position = useLoadedTimingData((s) => s.DriverList);
  const rows = Object.values(position).sort((a, b) => a.Line - b.Line);

  return (
    <table>
      <thead>
        <tr>
          <th>Position</th>
          <th>Number</th>
          <th>Name</th>
          <th>Team</th>
          <th>Country</th>
          <th>Speed</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <DriverRow key={row.Reference} racingNumber={row.RacingNumber} />
        ))}
      </tbody>
    </table>
  );
};

interface DriverRowProps {
  racingNumber: string;
}
const DriverRow = (props: DriverRowProps) => {
  const positionData = useLoadedTimingData((s) => s.DriverList[props.racingNumber]);
  const carData = useLoadedTimingData((s) => getLatestUtc(s.CarData.Entries).Cars[props.racingNumber]);

  return (
    <tr>
      <td>{positionData.Line}</td>
      <td>{positionData.RacingNumber}</td>
      <td>{positionData.BroadcastName}</td>
      <td>{positionData.TeamName}</td>
      <td>{positionData.CountryCode}</td>
      <td>{getCarDataValue(CarDataValue.SPEED, carData)}</td>
    </tr>
  );
};

const Time = () => {
  const currentTime = useTiming((s) => s.state.currentTime);
  const time = useLoadedTimingData((s) => s.Heartbeat.Utc);
  const clock = useLoadedTimingData((s) => s.ExtrapolatedClock);
  const lapCount = useLoadedTimingData((s) => s.LapCount);

  let timeRemaining: string;
  const now = addMilliseconds(new Date(time), differenceInMilliseconds(new Date(currentTime), new Date(clock.Utc)));

  if (clock.Extrapolating && clock.Utc) {
    const [startRemainingHours, startRemainingMinutes, startRemainingSeconds] = clock.Remaining.split(":").map(Number);
    const remainingStartSeconds = startRemainingSeconds + startRemainingMinutes * 60 + startRemainingHours * 60 * 60;
    const remaining = remainingStartSeconds - differenceInSeconds(now, new Date(clock.Utc));

    const remainingHours = Math.floor(remaining / 60 / 60);
    const remainingMinutes = Math.floor((remaining - remainingHours * 60 * 60) / 60);
    const remainingSeconds = remaining - remainingHours * 60 * 60 - remainingMinutes * 60;

    timeRemaining = `${padStart(remainingHours, 2)}:${padStart(remainingMinutes, 2)}:${padStart(remainingSeconds, 2)}`;
  } else {
    timeRemaining = clock.Remaining;
  }

  return (
    <div>
      <div>{timeRemaining}</div>
      <div>{formatISO(now)}</div>
      {lapCount != null && (
        <div>
          {lapCount.CurrentLap} / {lapCount.TotalLaps}
        </div>
      )}
    </div>
  );
};

const getRainfallText = (rainfall: number | undefined) => {
  if (rainfall === 1) {
    return "Yes";
  }
  if (rainfall === 0) {
    return "No";
  }
  return undefined;
};

const getWindDirection = (deg: number) => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.floor(deg / 45) % 8];
};
