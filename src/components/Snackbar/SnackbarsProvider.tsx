import {
  createContext,
  createRef,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { generateUID } from "../../utils/generateUID";
import { Snackbar } from "./Snackbar";
import styles from "./Snackbar.module.scss";

interface SnackbarData {
  id: string;
  title: ReactNode;
  content: ReactNode;
  time?: number;
  nodeRef: MutableRefObject<HTMLElement | undefined>;
}

type ArgumentSnackbarData = Omit<SnackbarData, "id" | "nodeRef"> & { id?: string };

const useSnackbarsState = () => {
  const [snackbars, setSnackbars] = useState<SnackbarData[]>([]);

  const openSnackbar = useCallback((snackbar: ArgumentSnackbarData) => {
    const snackbarId = snackbar.id ?? generateUID();

    setSnackbars((snackbars) => {
      const alreadyExistingSnackbarIndex = snackbars.findIndex(({ id }) => id === snackbarId);
      const newSnackbar = { ...snackbar, id: snackbarId, nodeRef: createMutableRef<HTMLElement | undefined>() };

      if (alreadyExistingSnackbarIndex >= 0) {
        return [
          ...snackbars.slice(0, alreadyExistingSnackbarIndex),
          newSnackbar,
          ...snackbars.slice(alreadyExistingSnackbarIndex + 1),
        ];
      }

      return [...snackbars, newSnackbar];
    });

    return snackbarId;
  }, []);

  const closeSnackbar = useCallback((snackbarId: string) => {
    setSnackbars((snackbars) => snackbars.filter(({ id }) => id !== snackbarId));
  }, []);

  return { snackbars, openSnackbar, closeSnackbar };
};

interface SnackbarsContextType {
  openSnackbar: (snackbar: ArgumentSnackbarData) => string;
  closeSnackbar: (snackbarId: string) => void;
}
const SnackbarsContext = createContext<SnackbarsContextType | null>(null);
interface SnackbarsProviderProps {
  children: ReactNode;
}
export const SnackbarsProvider = ({ children }: SnackbarsProviderProps) => {
  const { snackbars, closeSnackbar, openSnackbar } = useSnackbarsState();
  const [showDraggingOverlay, setShowDraggingOverlay] = useState(false);
  const [snackbarHeights, setSnackbarHeights] = useState<Record<string, number | undefined>>({});

  const contextValue = useMemo(
    (): SnackbarsContextType => ({ openSnackbar, closeSnackbar }),
    [closeSnackbar, openSnackbar],
  );

  const reversedSnackbars = useMemo(() => [...snackbars].reverse(), [snackbars]);

  return (
    <SnackbarsContext.Provider value={contextValue}>
      {children}
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
                onClose={() => closeSnackbar(snackbar.id)}
                setShowDraggingOverlay={setShowDraggingOverlay}
                ref={(ref) => {
                  snackbar.nodeRef.current = ref ?? undefined;
                }}
                time={snackbar.time}
                offsetY={getPreviousHeights(reversedSnackbars, i, snackbarHeights) + i * 8}
                onHeightChange={(height) => {
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
    </SnackbarsContext.Provider>
  );
};

export const useSnackbars = () => {
  const context = useContext(SnackbarsContext);

  if (context === null) {
    throw new Error("Using uninitialised SnackbarsContext");
  }

  return context;
};

function createMutableRef<T>() {
  return createRef<T>() as MutableRefObject<T>;
}

function getPreviousHeights(snackbars: SnackbarData[], i: number, snackbarHeights: Record<string, number | undefined>) {
  return snackbars.slice(0, i).reduce((acc, s) => acc + (snackbarHeights[s.id] ?? 0), 0);
}
