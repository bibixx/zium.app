import styles from "./Sidebar.module.scss";
import { ListItem } from "../../../components/ListItem/ListItem";
import { NavLink } from "react-router-dom";
import { COMING_SOON_SEASONS_DATA, DEFAULT_SEASON, SUPPORTED_SEASONS } from "../../../constants/seasons";

export const Sidebar = () => {
  return (
    <div className={styles.wrapper}>
      {SUPPORTED_SEASONS.map((season) => {
        const path = season === DEFAULT_SEASON ? "/" : `/season/${season}`;
        const comingSoonData = COMING_SOON_SEASONS_DATA[season];
        const isComingSoon = comingSoonData == null ? false : comingSoonData.getTime() > Date.now();

        return <SidebarElement season={season} path={path} isComingSoon={isComingSoon} key={season} />;
      })}
    </div>
  );
};

interface SidebarElementProps {
  season: string;
  path: string;
  isComingSoon?: boolean;
}
const SidebarElement = ({ season, path, isComingSoon = false }: SidebarElementProps) => {
  return (
    <div className={styles.element}>
      <NavLink to={path}>
        {({ isActive }) => (
          <>
            {isActive && <div className={styles.carrot} />}
            <ListItem caption={isComingSoon ? "Coming soon" : undefined} isActive={isActive}>
              Season {season}
            </ListItem>
          </>
        )}
      </NavLink>
    </div>
  );
};
