import cn from "classnames";
import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import { differenceInDays } from "date-fns";
import { SupportedSeasons, SUPPORTED_SEASONS } from "../../constants/seasons";
import { isSeasonComingSoon } from "../../utils/SeasonUtils";
import { HeaderCardWithZeroState } from "../../components/HeaderCard/HeaderCard";
import { useRacesList } from "../../hooks/useRacesList/useRacesList";
import { RacesState } from "../../hooks/useRacesList/useRacesList.types";
import { WithVariables } from "../../components/WithVariables/WithVariables";
import { useTrackWithTitle } from "../../hooks/useAnalytics/useAnalytics";
import { CookieBanner } from "../../components/CookieBanner/CookieBanner";
import { useHeaderCardData } from "../../hooks/useHeaderCardData/useHeaderCardData";
import { GlobalShortcutsSnackbar } from "../../components/ShortcutsSnackbar/ShortcutsSnackbar";
import { useEasterEgg } from "../../hooks/useEasterEgg/useEasterEgg";
import { mapAndStripNullable } from "../../utils/mapAndStrip";
import { Season } from "./Season/Season";
import styles from "./Races.module.scss";
import { Sidebar } from "./Sidebar/Sidebar";
import { useFirstVisibleSeason } from "./hooks/useFirstVisibleSeason";
import { Header, HEADER_HEIGHT } from "./Header/Header";
import {
  filterOutFutureRaces,
  getLatestFinishedRaceData,
  getWasSearchSuccessful,
  prepareForSearch,
  searchRacePredicate,
} from "./Races.utils";
import { ZeroState } from "./ZeroState/ZeroState";
import { useZiumOffsetsInfo } from "./hooks/useZiumOffsetsInfo/useZiumOffsetsInfo";

export const Races = () => {
  useTrackWithTitle("Races");
  useEasterEgg();

  const wrapperRefs = useRef<Array<HTMLDivElement | null>>([]);

  const seasonsToRender = useMemo(() => SUPPORTED_SEASONS, []);
  const [firstVisibleSeasonIndex, overwriteVisibleSeasonIndex] = useFirstVisibleSeason(wrapperRefs);
  const [searchQuery, setSearchQuery] = useState("");

  const { racesState: seasonsList } = useRacesList(seasonsToRender);
  const ziumOffsetsInfo = useZiumOffsetsInfo();

  const fallbackRaceId = useMemo(() => {
    const latestSeason = seasonsList.find((season) => !isSeasonComingSoon(season.seasonId));
    if (latestSeason?.state !== "done") {
      return null;
    }

    const { index, sortedRaces } = getLatestFinishedRaceData(latestSeason.data);
    const upcomingRace = sortedRaces[index - 1];
    const lastRace = sortedRaces[index];

    if (upcomingRace == null && lastRace == null) {
      return null;
    }

    if (upcomingRace == null) {
      return lastRace.id;
    }

    const daysSinceLastRace = differenceInDays(new Date(), lastRace.endDate);
    const daysTillNextRace = differenceInDays(upcomingRace.endDate, new Date());

    if (daysSinceLastRace < daysTillNextRace) {
      return lastRace.id;
    }

    return upcomingRace.id;
  }, [seasonsList]);
  const headerCardData = useHeaderCardData(fallbackRaceId);

  const filteredRacesState = useMemo((): RacesState[] => {
    const transliteratedSearchQuery = prepareForSearch(searchQuery);

    return mapAndStripNullable(seasonsList, (season) => {
      if (season.state !== "done") {
        return season;
      }

      return {
        ...season,
        data: filterOutFutureRaces(season.data).filter(searchRacePredicate(transliteratedSearchQuery)),
      };
    });
  }, [searchQuery, seasonsList]);

  const wasSearchSuccessful = getWasSearchSuccessful(filteredRacesState);

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
    <WithVariables variables={{ "header-height": `${HEADER_HEIGHT}px` }}>
      <div id="top" tabIndex={-1} />
      <div className={cn(styles.races, styles.layout)}>
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          overwriteVisibleSeason={() => overwriteVisibleSeason(seasonsToRender[0])}
        />
        <Sidebar
          visibleSeasonId={seasonsToRender[firstVisibleSeasonIndex]}
          seasons={seasonsList.map((season) => ({
            seasonId: season.seasonId,
            count: season.state === "done" ? season.data.length : null,
          }))}
          overwriteVisibleSeason={overwriteVisibleSeason}
        />
        <div className={styles.seasons}>
          <HeaderCardWithZeroState eventState={headerCardData} />
          {!wasSearchSuccessful && <ZeroState />}
          {filteredRacesState.map((season, i) => {
            const prevSeason = filteredRacesState[i - 1];
            const nextSeason = filteredRacesState[i + 1];

            return (
              <Fragment key={season.seasonId}>
                {prevSeason && (
                  <a className={styles.skipLink} href={`#season-${prevSeason.seasonId}`}>
                    Jump to season {prevSeason.seasonId}
                  </a>
                )}
                {nextSeason && (
                  <a className={styles.skipLink} href={`#season-${nextSeason.seasonId}`}>
                    Jump to season {nextSeason.seasonId}
                  </a>
                )}
                <div
                  style={{ display: season.state === "done" && season.data.length === 0 ? "none" : undefined }}
                  ref={(ref) => {
                    wrapperRefs.current[i] = ref;
                  }}
                >
                  <Season season={season} ziumOffsetsInfo={ziumOffsetsInfo} />
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
      <GlobalShortcutsSnackbar />
      <CookieBanner mode="sticky" position="bottom" />
    </WithVariables>
  );
};
