import classNames from "classnames";
import { useCallback, useMemo, useRef } from "react";
import { SEASON_TO_F1_ID_MAP, SupportedSeasons, SUPPORTED_SEASONS } from "../../constants/seasons";
import { isSeasonComingSoon } from "../../utils/SeasonUtils";
import { LiveCard } from "../../components/LiveCard/LiveCard";
import { useLiveEvent } from "../../hooks/useLiveEvent/useLiveEvent";
import { Season } from "./Season/Season";
import styles from "./Races.module.scss";
import { Sidebar } from "./Sidebar/Sidebar";
import { useFirstVisibleSeason } from "./hooks/useFirstVisibleSeason";

export const Races = () => {
  const wrapperRefs = useRef<Array<HTMLDivElement | null>>([]);

  const seasonsToRender = useMemo(() => SUPPORTED_SEASONS.filter((season) => !isSeasonComingSoon(season)), []);
  const [firstVisibleSeasonIndex, overwriteVisibleSeasonIndex] = useFirstVisibleSeason(wrapperRefs);
  const liveEvent = useLiveEvent();

  const overwriteVisibleSeason = useCallback(
    (season: SupportedSeasons) => {
      const seasonIndex = seasonsToRender.indexOf(season);
      if (seasonIndex >= 0) {
        overwriteVisibleSeasonIndex(seasonsToRender.indexOf(season));
      }
    },
    [overwriteVisibleSeasonIndex, seasonsToRender],
  );

  return (
    <div>
      <div className={classNames(styles.races, styles.layout)}>
        <Sidebar
          visibleSeasonId={seasonsToRender[firstVisibleSeasonIndex]}
          overwriteVisibleSeason={overwriteVisibleSeason}
        />
        <div>
          {liveEvent.state === "done" && liveEvent.data !== null && <LiveCard raceDetails={liveEvent.data} />}
          {seasonsToRender.map((seasonId, i) => {
            const seasonApiId = SEASON_TO_F1_ID_MAP[seasonId];

            return (
              <div
                key={seasonId}
                ref={(ref) => {
                  wrapperRefs.current[i] = ref;
                }}
              >
                <h2 className={styles.heading} id={`season-${seasonId}`}>
                  Season {seasonId}
                </h2>
                <div className={styles.grid}>
                  <Season seasonApiId={seasonApiId} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
