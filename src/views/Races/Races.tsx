import { Season } from "./Season/Season";
import styles from "./Races.module.scss";
import { Sidebar } from "./Sidebar/Sidebar";
import { Header } from "./Header/Header";
import classNames from "classnames";
import { Link, Navigate, useParams } from "react-router-dom";
import { RaceDetails } from "./RaceDetails/RaceDetails";
import { DEFAULT_SEASON, SEASON_TO_F1_ID_MAP, SupportedSeasons, SUPPORTED_SEASONS } from "../../constants/seasons";

interface RacesProps {
  seasonApiId: string;
  seasonId: string;
  eventId: string | undefined;
}
export const Races = ({ seasonApiId, seasonId, eventId }: RacesProps) => {
  const HeaderWrapper = eventId != null ? Link : "div";

  return (
    <div>
      <Header />
      <div className={classNames(styles.races, styles.layout)}>
        <Sidebar />
        <div>
          <HeaderWrapper to={`/season/${seasonId}`}>
            <h2 className={styles.heading}>Season {seasonId}</h2>
          </HeaderWrapper>

          <div className={styles.grid}>
            {eventId == null && <Season seasonApiId={seasonApiId} seasonId={seasonId} />}
            {eventId != null && <RaceDetails id={eventId} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export const RacesWithRedirect = () => {
  const { seasonId, eventId } = useParams();
  const seasonIdWithDefault = seasonId ?? DEFAULT_SEASON;
  const isSupportedSeason = getIsSupportedSeason(seasonIdWithDefault);

  if (seasonId === DEFAULT_SEASON && eventId == null) {
    return <Navigate to="/" />;
  }

  if (!isSupportedSeason) {
    return <Navigate to="/" />;
  }

  const f1SeasonId = SEASON_TO_F1_ID_MAP[seasonIdWithDefault];
  return <Races seasonApiId={f1SeasonId} seasonId={seasonIdWithDefault} eventId={eventId} />;
};

const getIsSupportedSeason = function <T extends SupportedSeasons>(seasonId: T | string): seasonId is SupportedSeasons {
  return (SUPPORTED_SEASONS as readonly string[]).includes(seasonId);
};
