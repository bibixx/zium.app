import cn from "classnames";
import { Link } from "react-router-dom";
import { useCallback, useRef, useState } from "react";
import { ListItem } from "../../../components/ListItem/ListItem";
import { SupportedSeasons } from "../../../constants/seasons";
import { isSeasonComingSoon } from "../../../utils/SeasonUtils";
import { WithVariables } from "../../../components/WithVariables/WithVariables";
import { FigmaIcon, GitHubIcon, TwitterIcon } from "../../../components/CustomIcons/CustomIcons";
import { MIDDLE_DOT } from "../../../utils/text";
import { ShortcutsSnackbar } from "../../../components/ShortcutsSnackbar/ShortcutsSnackbar";
import { useElementHeight } from "../../../hooks/useElementHeight/useElementHeight";
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
  const [isShortcutsSidebarOpen, setIsShortcutsSidebarOpen] = useState(false);
  const onShortcutsSidebarClose = useCallback(() => {
    setIsShortcutsSidebarOpen(false);
  }, []);

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

  const { isVisible: isLonelyMiddleDotVisible, middleDotWrapperRef } = useLonelyMiddleDot();
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
      <footer className={styles.footer}>
        <div className={styles.footerButtonsWrapper}>
          <a
            href="https://twitter.com/ziumapp"
            className={cn(styles.footerLink, styles.footerIconLink)}
            target="_blank"
            rel="noreferrer noopener"
          >
            <TwitterIcon height={20} />
          </a>
          <a
            href="https://github.com/bibixx/zium.app"
            className={cn(styles.footerLink, styles.footerIconLink)}
            target="_blank"
            rel="noreferrer noopener"
          >
            <GitHubIcon height={20} />
          </a>
          <a
            href="https://www.figma.com/community/file/1250905585551204036"
            className={cn(styles.footerLink, styles.footerIconLink)}
            target="_blank"
            rel="noreferrer noopener"
          >
            <FigmaIcon height={20} />
          </a>
        </div>
        <div className={styles.footerText} ref={middleDotWrapperRef}>
          <div className={styles.footerTextSection}>
            <button className={styles.footerLink} onClick={() => setIsShortcutsSidebarOpen(true)}>
              Keyboard shortcuts
            </button>
            <ShortcutsSnackbar isOpen={isShortcutsSidebarOpen} onClose={onShortcutsSidebarClose} />
            <span className={cn(styles.lonelyMiddleDot, { [styles.isHidden]: !isLonelyMiddleDotVisible })}>
              {MIDDLE_DOT}
            </span>
          </div>
          <div className={styles.footerTextSection}>
            <Link to="/privacy-policy" className={styles.footerLink}>
              Privacy policy
            </Link>
            <span>{MIDDLE_DOT}</span>
            <a href="mailto:zium@zium.app" className={styles.footerLink}>
              Contact us
            </a>
          </div>
        </div>
      </footer>
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

const useLonelyMiddleDot = () => {
  const [isVisible, setIsVisible] = useState(true);
  const middleDotWrapperRef = useRef<HTMLDivElement>(null);
  useElementHeight((height) => setIsVisible(height < 24), middleDotWrapperRef);

  return { isVisible, middleDotWrapperRef };
};
