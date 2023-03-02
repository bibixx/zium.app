import styles from "./Sidebar.module.scss";
import { ListItem } from "../../../components/ListItem/ListItem";
import { SupportedSeasons, SUPPORTED_SEASONS } from "../../../constants/seasons";
import { isSeasonComingSoon } from "../../../utils/SeasonUtils";
import { WithVariables } from "../../../components/WithVariables/WithVariables";
import { Header } from "../Header/Header";

interface SidebarProps {
  visibleSeasonId: string;
  overwriteVisibleSeason: (season: SupportedSeasons) => void;
}
export const Sidebar = ({ visibleSeasonId, overwriteVisibleSeason }: SidebarProps) => {
  const visibleSeasonIndex = (SUPPORTED_SEASONS as readonly string[]).indexOf(visibleSeasonId);

  const onSidebarElementClick = (season: SupportedSeasons) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey) {
      return;
    }

    e.preventDefault();
    const id = `season-${season}`;
    const $scrollToElement = document.getElementById(id);
    if ($scrollToElement == null) {
      return;
    }

    overwriteVisibleSeason(season);
    $scrollToElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.elementsWrapper}>
        <WithVariables className={styles.carrot} variables={{ i: visibleSeasonIndex }} />
        {SUPPORTED_SEASONS.map((season) => {
          const isComingSoon = isSeasonComingSoon(season);

          return (
            <SidebarElement
              season={season}
              isComingSoon={isComingSoon}
              key={season}
              isActive={visibleSeasonId === season}
              onSidebarElementClick={onSidebarElementClick(season)}
            />
          );
        })}
      </div>
    </div>
  );
};

interface SidebarElementProps {
  season: string;
  isComingSoon?: boolean;
  isActive: boolean;
  onSidebarElementClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}
const SidebarElement = ({ season, isComingSoon = false, isActive, onSidebarElementClick }: SidebarElementProps) => {
  return (
    <div className={styles.element}>
      <ListItem
        as="a"
        href={`#season-${season}`}
        caption={isComingSoon ? "Coming soon" : undefined}
        isActive={isActive}
        onClick={onSidebarElementClick}
      >
        <div>Season {season}</div>
      </ListItem>
    </div>
  );
};
