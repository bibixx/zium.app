import { useEffect, useMemo, useState } from "react";

import type { PositionCar } from "../../../types/liveTiming/types/state.type";
import type { Map, TrackPosition } from "../../../types/liveTiming/types/map.type";
import { objectEntries } from "../../../utils/liveTiming/driverHelper";
import { usePositionStore, useDataStore } from "../../../hooks/liveTiming/useStores/useDataStore";
import { useSettingsStore } from "../../../hooks/liveTiming/useStores/useSettingsStore";
import styles from "./Map.module.scss";
import {
  getTrackStatusMessage,
  fetchMap,
  createSectors,
  findYellowSectors,
  getSectorColor,
  MapSector,
  prioritizeColoredSectors,
  rad,
  rotate,
} from "./Map.utils";

// This is basically fearlessly copied from
// https://github.com/tdjsnelling/monaco

const SPACE = 1000;
const ROTATION_FIX = 90;

type Corner = {
  number: number;
  pos: TrackPosition;
  labelPos: TrackPosition;
};

export function Map() {
  const showCornerNumbers = useSettingsStore((state) => state.showCornerNumbers);
  const favoriteDrivers = useSettingsStore((state) => state.favoriteDrivers);

  const positions = usePositionStore((state) => state.positions);
  const drivers = useDataStore((state) => state?.driverList);
  const trackStatus = useDataStore((state) => state?.trackStatus);
  const timingDrivers = useDataStore((state) => state?.timingData);
  const raceControlMessages = useDataStore((state) => state?.raceControlMessages?.messages);
  const circuitKey = useDataStore((state) => state?.sessionInfo?.meeting.circuit.key);

  const [[minX, minY, widthX, widthY], setBounds] = useState<(null | number)[]>([null, null, null, null]);
  const [[centerX, centerY], setCenter] = useState<(null | number)[]>([null, null]);

  const [points, setPoints] = useState<null | { x: number; y: number }[]>(null);
  const [sectors, setSectors] = useState<MapSector[]>([]);
  const [corners, setCorners] = useState<Corner[]>([]);
  const [rotation, setRotation] = useState<number>(0);

  useEffect(() => {
    (async () => {
      if (!circuitKey) return;
      const mapJson = await fetchMap(circuitKey);

      const centerX = (Math.max(...mapJson.x) - Math.min(...mapJson.x)) / 2;
      const centerY = (Math.max(...mapJson.y) - Math.min(...mapJson.y)) / 2;

      const fixedRotation = mapJson.rotation + ROTATION_FIX;

      const sectors = createSectors(mapJson).map((s) => ({
        ...s,
        start: rotate(s.start.x, s.start.y, fixedRotation, centerX, centerY),
        end: rotate(s.end.x, s.end.y, fixedRotation, centerX, centerY),
        points: s.points.map((p) => rotate(p.x, p.y, fixedRotation, centerX, centerY)),
      }));

      const cornerPositions: Corner[] = mapJson.corners.map((corner) => ({
        number: corner.number,
        pos: rotate(corner.trackPosition.x, corner.trackPosition.y, fixedRotation, centerX, centerY),
        labelPos: rotate(
          corner.trackPosition.x + 540 * Math.cos(rad(corner.angle)),
          corner.trackPosition.y + 540 * Math.sin(rad(corner.angle)),
          fixedRotation,
          centerX,
          centerY,
        ),
      }));

      const rotatedPoints = mapJson.x.map((x, index) => rotate(x, mapJson.y[index], fixedRotation, centerX, centerY));

      const pointsX = rotatedPoints.map((item) => item.x);
      const pointsY = rotatedPoints.map((item) => item.y);

      const cMinX = Math.min(...pointsX) - SPACE;
      const cMinY = Math.min(...pointsY) - SPACE;
      const cWidthX = Math.max(...pointsX) - cMinX + SPACE * 2;
      const cWidthY = Math.max(...pointsY) - cMinY + SPACE * 2;

      setCenter([centerX, centerY]);
      setBounds([cMinX, cMinY, cWidthX, cWidthY]);
      setSectors(sectors);
      setPoints(rotatedPoints);
      setRotation(fixedRotation);
      setCorners(cornerPositions);
    })();
  }, [circuitKey]);

  const yellowSectors = useMemo(() => findYellowSectors(raceControlMessages), [raceControlMessages]);

  const renderedSectors = useMemo(() => {
    const status = getTrackStatusMessage(trackStatus?.status ? parseInt(trackStatus.status) : undefined);

    return sectors
      .map((sector) => {
        const color = getSectorColor(sector, status?.bySector, status?.trackColor, yellowSectors);
        const colorClass =
          color === "stroke-white"
            ? styles.white
            : color === "stroke-yellow"
            ? styles.yellow
            : color === "stroke-red"
            ? styles.red
            : color === "stroke-green"
            ? styles.green
            : color === "stroke-blue"
            ? styles.blue
            : "";
        return {
          colorClass,
          pulse: status?.pulse,
          number: sector.number,
          strokeWidth: colorClass === styles.white ? 60 : 120,
          d: `M${sector.points[0].x},${sector.points[0].y} ${sector.points
            .map((point) => `L${point.x},${point.y}`)
            .join(" ")}`,
        };
      })
      .sort(prioritizeColoredSectors);
  }, [trackStatus, sectors]);

  if (!points || !minX || !minY || !widthX || !widthY) {
    return (
      <div className={styles.container}>
        <div className={`${styles.container} ${styles.loading}`} />
      </div>
    );
  }

  return (
    <svg viewBox={`${minX} ${minY} ${widthX} ${widthY}`} className={styles.map} xmlns="http://www.w3.org/2000/svg">
      <path
        className={styles.track}
        d={`M${points[0].x},${points[0].y} ${points.map((point) => `L${point.x},${point.y}`).join(" ")}`}
      />

      {renderedSectors.map((sector) => {
        const style = sector.pulse
          ? {
              animation: `${sector.pulse * 100}ms linear infinite pulse`,
            }
          : {};
        return (
          <path
            key={`map.sector.${sector.number}`}
            className={`${styles.sector} ${sector.colorClass}`}
            strokeWidth={sector.strokeWidth}
            d={sector.d}
            style={style}
          />
        );
      })}

      {showCornerNumbers &&
        corners.map((corner) => (
          <CornerNumber
            key={`corner.${corner.number}`}
            number={corner.number}
            x={corner.labelPos.x}
            y={corner.labelPos.y}
          />
        ))}

      {centerX && centerY && positions && drivers && (
        <>
          {objectEntries(drivers)
            .reverse()
            .filter((driver) => !!positions[driver.racingNumber].X && !!positions[driver.racingNumber].Y)
            .map((driver) => {
              const timingDriver = timingDrivers?.lines[driver.racingNumber];
              const hidden = timingDriver
                ? timingDriver.knockedOut || timingDriver.stopped || timingDriver.retired
                : false;
              const pit = timingDriver ? timingDriver.inPit : false;

              return (
                <CarDot
                  key={`map.driver.${driver.racingNumber}`}
                  favoriteDriver={favoriteDrivers.length > 0 ? favoriteDrivers.includes(driver.racingNumber) : false}
                  name={driver.tla}
                  color={driver.teamColour}
                  pit={pit}
                  hidden={hidden}
                  pos={positions[driver.racingNumber]}
                  rotation={rotation}
                  centerX={centerX}
                  centerY={centerY}
                />
              );
            })}
        </>
      )}
    </svg>
  );
}

type CornerNumberProps = {
  number: number;
  x: number;
  y: number;
};

const CornerNumber = ({ number, x, y }: CornerNumberProps) => {
  return (
    <text x={x} y={y} className={styles.cornerNumber}>
      {number}
    </text>
  );
};

type CarDotProps = {
  name: string;
  color: string | undefined;
  favoriteDriver: boolean;
  pit: boolean;
  hidden: boolean;
  pos: PositionCar;
  rotation: number;
  centerX: number;
  centerY: number;
};

const CarDot = ({ pos, name, color, favoriteDriver, pit, hidden, rotation, centerX, centerY }: CarDotProps) => {
  const rotatedPos = rotate(pos.X, pos.Y, rotation, centerX, centerY);
  const transform = [`translateX(${rotatedPos.x}px)`, `translateY(${rotatedPos.y}px)`].join(" ");

  const carDotClasses = [styles.carDot, pit && styles.pit, hidden && styles.hidden].filter(Boolean).join(" ");

  return (
    <g
      className={carDotClasses}
      style={{
        transform,
        ...(color && { fill: `#${color}` }),
      }}
    >
      <circle id={`map.driver.circle`} className={styles.circle} />
      <text id={`map.driver.text`} className={styles.text}>
        {name}
      </text>

      {favoriteDriver && <circle id={`map.driver.favorite`} className={styles.favorite} />}
    </g>
  );
};
