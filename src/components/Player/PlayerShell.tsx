import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useViewerUIVisibility } from "../../hooks/useViewerUIVisibility/useViewerUIVisibility";
import { Button } from "../Button/Button";
import { DoubleEllipsisIcon } from "../CustomIcons/CustomIcons";
import styles from "./Player.module.scss";
import raceInfoStyles from "./PlayerRaceInfo/PlayerRaceInfo.module.scss";
import shellStyles from "./PlayerShell.module.scss";

export const PlayerShell = () => {
  const { isUIVisible, preventHiding } = useViewerUIVisibility();

  useEffect(() => {
    preventHiding(true);
    return () => preventHiding(false);
  }, [preventHiding]);

  return (
    <div className={classNames(styles.wrapper, { [styles.isVisible]: isUIVisible })}>
      <div className={styles.dragHandlePlaceholder} />
      <div className={styles.dragHandle}>
        <DoubleEllipsisIcon width={20} height={20} />
      </div>

      <div className={styles.content}>
        <div className={styles.section} style={{ boxShadow: "none" }}>
          <div className={raceInfoStyles.wrapper}>
            <Button variant="Tertiary" iconLeft={ArrowLeftIcon} as={Link} to="/" aria-label="Go back" />
            <div className={raceInfoStyles.countryContent}>
              <div className={classNames(shellStyles.skeleton, shellStyles.flag)} />
              <div>
                <div className={classNames(shellStyles.skeleton, shellStyles.countryName)} />
                <div className={classNames(shellStyles.skeleton, shellStyles.eventTitle)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
