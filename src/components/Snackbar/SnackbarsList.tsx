import { useMemo, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Snackbar } from "./Snackbar";
import styles from "./Snackbar.module.scss";
import { SnackbarData, useSnackbarsState } from "./SnackbarsList.hooks";

export const SnackbarsList = () => {
  const { snackbars, closeSnackbar } = useSnackbarsState();
  const [showDraggingOverlay, setShowDraggingOverlay] = useState(false);
  const [snackbarHeights, setSnackbarHeights] = useState<Record<string, number | undefined>>({});
  const reversedSnackbars = useMemo(() => [...snackbars].reverse(), [snackbars]);

  return (
    <>
      {showDraggingOverlay && <div className={styles.draggingOverlay} />}
      <div className={styles.snackbarsWrapper}>
        <TransitionGroup component={null}>
          {reversedSnackbars.slice(0, 3).map((snackbar, i) => (
            <CSSTransition
              key={snackbar.id}
              nodeRef={snackbar.nodeRef}
              addEndListener={(done: () => void) => {
                snackbar.nodeRef.current?.addEventListener(
                  "transitionend",
                  (e) => {
                    if (e.target instanceof HTMLElement && e.target.dataset.cssTransition) {
                      done();
                    }
                  },
                  false,
                );
              }}
              onExited={() => closeSnackbar(snackbar.id)}
              classNames={{
                enter: styles.enter,
                enterActive: styles.enterActive,
                exit: styles.exit,
                exitActive: styles.exitActive,
              }}
            >
              <Snackbar
                title={snackbar.title}
                content={snackbar.content}
                pictureConfig={snackbar.pictureConfig}
                onClose={() => closeSnackbar(snackbar.id)}
                setShowDraggingOverlay={setShowDraggingOverlay}
                ref={(ref) => {
                  snackbar.nodeRef.current = ref ?? undefined;
                }}
                time={snackbar.time}
                actions={snackbar.actions}
                offsetY={getPreviousHeights(reversedSnackbars, i, snackbarHeights) + i * 8}
                onHeightChange={({ height }) => {
                  setSnackbarHeights((heights) => ({
                    ...heights,
                    [snackbar.id]: height,
                  }));
                }}
              />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
    </>
  );
};

function getPreviousHeights(snackbars: SnackbarData[], i: number, snackbarHeights: Record<string, number | undefined>) {
  return snackbars.slice(0, i).reduce((acc, s) => acc + (snackbarHeights[s.id] ?? 0), 0);
}
