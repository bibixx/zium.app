import { useEffect, useRef, useState } from "react";

import type { CarData, CarsData, Position, Positions, State } from "../../../types/liveTiming/types/state.type";
import type { MessageInitial, MessageUpdate } from "../../../types/liveTiming/types/message.type";
import { useBuffer } from "../useBuffer/useBuffer";
import { useStatefulBuffer } from "../useBuffer/useStatefulBuffer";
import { useSettingsStore } from "../useStores/useSettingsStore";
import { inflate, utcToLocalMs } from "./useDataEngine.utils";

const UPDATE_MS = 200;

type Props = {
  updateState: (state: State) => void;
  updatePosition: (pos: Positions) => void;
  updateCarData: (car: CarsData) => void;
};

export const useDataEngine = ({ updateState, updatePosition, updateCarData }: Props) => {
  const extrapolatedClockBuffer = useStatefulBuffer();
  const topThreeBuffer = useStatefulBuffer();
  const timingStatsBuffer = useStatefulBuffer();
  const timingAppDataBuffer = useStatefulBuffer();
  const weatherDataBuffer = useStatefulBuffer();
  const trackStatusBuffer = useStatefulBuffer();
  const driverListBuffer = useStatefulBuffer();
  const raceControlMessagesBuffer = useStatefulBuffer();
  const sessionInfoBuffer = useStatefulBuffer();
  const sessionDataBuffer = useStatefulBuffer();
  const lapCountBuffer = useStatefulBuffer();
  const timingDataBuffer = useStatefulBuffer();
  const teamRadioBuffer = useStatefulBuffer();
  const championshipPredictionBuffer = useStatefulBuffer();

  const buffers = {
    extrapolatedClock: extrapolatedClockBuffer,
    topThree: topThreeBuffer,
    timingStats: timingStatsBuffer,
    timingAppData: timingAppDataBuffer,
    weatherData: weatherDataBuffer,
    trackStatus: trackStatusBuffer,
    driverList: driverListBuffer,
    raceControlMessages: raceControlMessagesBuffer,
    sessionInfo: sessionInfoBuffer,
    sessionData: sessionDataBuffer,
    lapCount: lapCountBuffer,
    timingData: timingDataBuffer,
    teamRadio: teamRadioBuffer,
    championshipPrediction: championshipPredictionBuffer,
  };

  const carBuffer = useBuffer<CarsData>();
  const posBuffer = useBuffer<Positions>();

  const [maxDelay, setMaxDelay] = useState<number>(0);

  const delayRef = useRef<number>(0);

  useSettingsStore.subscribe(
    (state) => state.delay,
    (delay) => (delayRef.current = delay),
    { fireImmediately: true },
  );

  const intervalRef = useRef<number | null>(null);

  const handleInitial = ({ carDataZ, positionZ, ...initial }: MessageInitial) => {
    updateState(initial);

    Object.keys(buffers).forEach((key) => {
      const data = initial[key as keyof typeof initial];
      const buffer = buffers[key as keyof typeof buffers];
      if (data) buffer.set(data);
    });

    if (carDataZ) {
      const carData = inflate<CarData>(carDataZ);
      // carDataStore.set(carData.Entries[0].Cars);
      updateCarData(carData.Entries[0].Cars);

      for (const entry of carData.Entries) {
        carBuffer.pushTimed(entry.Cars, utcToLocalMs(entry.Utc));
      }
    }

    if (positionZ) {
      const position = inflate<Position>(positionZ);
      // positionStore.set(position.Position[0].Entries);
      updatePosition(position.Position[0].Entries);

      for (const entry of position.Position) {
        posBuffer.pushTimed(entry.Entries, utcToLocalMs(entry.Timestamp));
      }
    }
  };

  const handleUpdate = ({ carDataZ, positionZ, ...update }: MessageUpdate) => {
    Object.keys(buffers).forEach((key) => {
      const data = update[key as keyof typeof update];
      const buffer = buffers[key as keyof typeof buffers];
      if (data) buffer.push(data);
    });

    if (carDataZ) {
      const carData = inflate<CarData>(carDataZ);
      for (const entry of carData.Entries) {
        carBuffer.pushTimed(entry.Cars, utcToLocalMs(entry.Utc));
      }
    }

    if (positionZ) {
      const position = inflate<Position>(positionZ);
      for (const entry of position.Position) {
        posBuffer.pushTimed(entry.Entries, utcToLocalMs(entry.Timestamp));
      }
    }
  };

  const handleCurrentState = () => {
    const delay = delayRef.current;

    if (delay === 0) {
      const newStateFrame: State = {} as State;

      Object.keys(buffers).forEach((key) => {
        const buffer = buffers[key as keyof typeof buffers];
        const latest = buffer.latest();
        // if (latest) dataStore.set({ [key]: latest });
        if (latest) newStateFrame[key as keyof typeof newStateFrame] = latest as any;
      });

      updateState(newStateFrame);

      const carFrame = carBuffer.latest();
      // if (carFrame) carDataStore.set(carFrame);
      if (carFrame) updateCarData(carFrame);

      const posFrame = posBuffer.latest();
      // if (posFrame) positionStore.set(posFrame);
      if (posFrame) updatePosition(posFrame);
    } else {
      const delayedTimestamp = Date.now() - delay * 1000;

      Object.keys(buffers).forEach((key) => {
        const buffer = buffers[key as keyof typeof buffers];
        const delayed = buffer.delayed(delayedTimestamp);

        // if (delayed) dataStore.set({ [key]: delayed });
        if (delayed) updateState({ [key]: delayed });

        setTimeout(() => buffer.cleanup(delayedTimestamp), 0);
      });

      const carFrame = carBuffer.delayed(delayedTimestamp);
      if (carFrame) {
        // carDataStore.set(carFrame);
        updateCarData(carFrame);

        setTimeout(() => carBuffer.cleanup(delayedTimestamp), 0);
      }

      const posFrame = posBuffer.delayed(delayedTimestamp);
      if (posFrame) {
        // positionStore.set(posFrame);
        updatePosition(posFrame);

        setTimeout(() => posBuffer.cleanup(delayedTimestamp), 0);
      }
    }

    const maxDelay = Math.max(
      ...Object.values(buffers).map((buffer) => buffer.maxDelay()),
      carBuffer.maxDelay(),
      posBuffer.maxDelay(),
    );

    setMaxDelay(maxDelay);
  };

  useEffect(() => {
    intervalRef.current = setInterval(handleCurrentState, UPDATE_MS);
    return () => (intervalRef.current ? clearInterval(intervalRef.current) : void 0);
  }, []);

  return {
    handleUpdate,
    handleInitial,
    maxDelay,
  };
};
