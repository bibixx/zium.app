import { Season } from "./Season/Season";
import styles from "./Races.module.scss";
import { Sidebar } from "./Sidebar/Sidebar";
import classNames from "classnames";
import { SEASON_TO_F1_ID_MAP, SupportedSeasons, SUPPORTED_SEASONS } from "../../constants/seasons";
import { isSeasonComingSoon } from "../../utils/SeasonUtils";
import { useCallback, useMemo, useRef } from "react";
import { useFirstVisibleSeason } from "./Season/Season.hook";

export const Races = () => {
  const wrapperRefs = useRef<Array<HTMLDivElement | null>>([]);

  const seasonsToRender = useMemo(() => SUPPORTED_SEASONS.filter((season) => !isSeasonComingSoon(season)), []);
  const [firstVisibleSeasonIndex, overwriteVisibleSeasonIndex] = useFirstVisibleSeason(wrapperRefs);

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
                  <Season seasonApiId={seasonApiId} seasonId={seasonId} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
