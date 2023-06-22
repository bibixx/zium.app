import cn from "classnames";
import { ListItem } from "../../../components/ListItem/ListItem";
import { SupportedSeasons } from "../../../constants/seasons";
import { isSeasonComingSoon } from "../../../utils/SeasonUtils";
import { WithVariables } from "../../../components/WithVariables/WithVariables";
import styles from "./Sidebar.module.scss";

interface SidebarSeason {
  seasonId: SupportedSeasons;
  count: number | null;
}

interface SidebarProps {
  visibleSeasonId: SupportedSeasons;
  seasons: SidebarSeason[];
  overwriteVisibleSeason: (season: SupportedSeasons) => void;
}
export const Sidebar = ({ visibleSeasonId, seasons, overwriteVisibleSeason }: SidebarProps) => {
  const seasonIds = seasons.map((season) => season.seasonId);
  const visibleSeasonIndex = seasonIds.indexOf(visibleSeasonId);

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
      <div className={styles.elementsWrapper}>
        <WithVariables
          className={cn(styles.carrot, { [styles.isHidden]: visibleSeasonIndex < 0 })}
          variables={{ i: visibleSeasonIndex }}
        />
        {seasons.map((season) => {
          const isComingSoon = isSeasonComingSoon(season.seasonId);

          return (
            <SidebarElement
              season={season.seasonId}
              count={season.count}
              isComingSoon={isComingSoon}
              key={season.seasonId}
              isActive={visibleSeasonId === season.seasonId}
              onSidebarElementClick={onSidebarElementClick(season.seasonId)}
            />
          );
        })}
      </div>
    </div>
  );
};

interface SidebarElementProps {
  season: string;
  count: number | null;
  isComingSoon?: boolean;
  isActive: boolean;
  onSidebarElementClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}
const SidebarElement = ({
  season,
  isComingSoon = false,
  isActive,
  onSidebarElementClick,
  count,
}: SidebarElementProps) => {
  const baseProps = !isComingSoon ? ({ as: "a", href: `#season-${season}` } as const) : ({ as: "div" } as const);

  return (
    <div className={styles.element}>
      <ListItem
        {...baseProps}
        caption={isComingSoon ? "Coming soon" : count}
        disabled={isComingSoon || count === 0}
        isActive={isActive}
        onClick={onSidebarElementClick}
      >
        <div>Season {season}</div>
      </ListItem>
    </div>
  );
};
