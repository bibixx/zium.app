import { useEffect, useState } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { StopIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { Dialog } from "../Dialog/Dialog";
import { DialogContent, DialogContentAlert, DialogContentButtonFooter } from "../Dialog/DialogContent/DialogContent";
import { Button } from "../Button/Button";
import { addQueryParams } from "../../utils/addQueryParams";
import { useSnackbars } from "../Snackbar/SnackbarsProvider";
import { useWindowSize } from "../../hooks/useWindowSize";
import { useFeatureFlags } from "../../hooks/useFeatureFlags/useFeatureFlags";
import { saveStore } from "../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import styles from "./DebugPanel.module.scss";
import { debugStore, getLorem } from "./DebugPanel.utils";

export const DebugPanel = () => {
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "d") {
        setIsDebugPanelOpen((d) => !d);
      }
    };

    document.addEventListener("keydown", onKey, { capture: true });

    return () => {
      document.removeEventListener("keydown", onKey, { capture: true });
    };
  }, []);

  return (
    <Dialog isOpen={isDebugPanelOpen} onClose={() => setIsDebugPanelOpen(false)}>
      <DialogContent>
        <DebugPanelContents closePanel={() => setIsDebugPanelOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

interface DebugPanelContentsProps {
  closePanel: () => void;
}
const DebugPanelContents = (props: DebugPanelContentsProps) => {
  return (
    <>
      <div className={styles.header}>Debug options 🥚</div>
      <DebugWindowSize />
      <DebugSnackbars />
      <DebugRaceSettings {...props} />
    </>
  );
};

const DebugSnackbars = () => {
  const { openSnackbar, closeSnackbar } = useSnackbars();

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>Snackbars</div>
      <div className={styles.buttonsRow}>
        <Button
          variant="Secondary"
          onClick={() =>
            openSnackbar({
              content: getLorem(),
              title: getLorem(20),
            })
          }
        >
          Lorem ipsum
        </Button>
        <Button
          variant="Secondary"
          onClick={() => {
            const id = openSnackbar({
              title: "Weekend Warm-Up — Austria",
              content: "New event is live now",
              image: addQueryParams(
                `https://f1tv.formula1.com/image-resizer/image/1000007241-9dda9a2d-b17d-4b87-9432-3cab3171889e/landscape_hero_web`,
                {
                  w: 360 * devicePixelRatio,
                  h: 180 * devicePixelRatio,
                  q: "HI",
                  o: "L",
                },
              ),
              actions: (
                <div className={styles.buttonsWrapper}>
                  <Button variant="Primary" fluid onClick={() => closeSnackbar(id)}>
                    Watch now
                  </Button>
                  <Button variant="Secondary" fluid onClick={() => closeSnackbar(id)}>
                    Dismiss
                  </Button>
                </div>
              ),
              time: 60000,
            });
          }}
        >
          Live event
        </Button>
      </div>
    </div>
  );
};

interface ClearStorageDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}
const ClearStorageDialog = ({ onCancel, onConfirm }: ClearStorageDialogProps) => {
  return (
    <DialogContent maxWidth={368}>
      <DialogContentAlert
        title={`Are you sure you want to clear localStorage?`}
        subtitle={`You will loose all your settings and layouts`}
      />
      <DialogContentButtonFooter>
        <Button fluid variant="Secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button fluid variant="Primary" onClick={onConfirm}>
          Clear
        </Button>
      </DialogContentButtonFooter>
    </DialogContent>
  );
};

const DebugWindowSize = () => {
  const { width, height } = useWindowSize();
  const [isClearStorageDialogOpen, setIsClearStorageDialogOpen] = useState(false);

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>General</div>
        <div>Width: {width}</div>
        <div>Height: {height}</div>
        <Button variant="Secondary" onClick={() => setIsClearStorageDialogOpen(true)}>
          Clear localStorage
        </Button>
      </div>

      <Dialog isOpen={isClearStorageDialogOpen} onClose={() => setIsClearStorageDialogOpen(false)}>
        <ClearStorageDialog
          onCancel={() => setIsClearStorageDialogOpen(false)}
          onConfirm={() => {
            localStorage.clear();
            window.location.reload();
          }}
        />
      </Dialog>
    </>
  );
};

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onChange: (newValue: boolean) => void;
}
const CheckboxRow = ({ label, checked, onChange }: CheckboxRowProps) => (
  <label className={styles.checkboxRow}>
    <input
      className={styles.checkboxInput}
      type="checkbox"
      onChange={(e) => onChange(e.target.checked)}
      checked={checked}
    />
    <Button
      as="div"
      className={styles.checkboxButton}
      iconLeft={checked ? CheckIcon : StopIcon}
      variant={"Secondary"}
    />
    {label}
  </label>
);

const DebugRaceSettings = ({ closePanel }: DebugPanelContentsProps) => {
  const { flags, updateFlag } = useFeatureFlags();
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>Race</div>
      <CheckboxRow
        label="Increase background contrast"
        checked={flags.increaseBackgroundContrast}
        onChange={updateFlag("increaseBackgroundContrast")}
      />
      <CheckboxRow
        label="Show window borders"
        checked={flags.showWindowBorders}
        onChange={updateFlag("showWindowBorders")}
      />
      <CheckboxRow label="Never hide UI" checked={flags.forceUiVisibility} onChange={updateFlag("forceUiVisibility")} />
      <Button variant={"Secondary"} as={Link} to="/race/__DEBUG__" onClick={closePanel}>
        Open debug live stream
      </Button>
      <Button
        variant={"Secondary"}
        onClick={() => {
          saveStore(debugStore);
          window.location.reload();
        }}
      >
        Load debug store
      </Button>
    </div>
  );
};
