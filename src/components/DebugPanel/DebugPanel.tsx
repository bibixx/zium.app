import { useEffect, useState } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { StopIcon } from "@heroicons/react/24/outline";
import { Link, useParams } from "react-router-dom";
import { Dialog } from "../Dialog/Dialog";
import { DialogContent, DialogContentAlert, DialogContentButtonFooter } from "../Dialog/DialogContent/DialogContent";
import { Button } from "../Button/Button";
import { useSnackbars } from "../Snackbar/SnackbarsProvider";
import { useFeatureFlags } from "../../hooks/useFeatureFlags/useFeatureFlags";
import { saveStore } from "../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import { getNewEventSnackbarData } from "../../views/Viewer/hooks/useNotifyAboutNewEvent/useNotifyAboutNewEvent.utils";
import styles from "./DebugPanel.module.scss";
import { debugStore, downloadOffsetsForCurrentRace, getLorem } from "./DebugPanel.utils";

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
      <DebugGeneralSection />
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
            const id = openSnackbar(
              getNewEventSnackbarData(
                "Weekend Warm-Up — Austria",
                "1000007241",
                "1000007241-9dda9a2d-b17d-4b87-9432-3cab3171889e/landscape_hero_web",
                () => closeSnackbar(id),
              ),
            );
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

const DebugGeneralSection = () => {
  const [isClearStorageDialogOpen, setIsClearStorageDialogOpen] = useState(false);
  const { resetFlags } = useFeatureFlags();

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>General</div>
        <div className={styles.buttonsRow}>
          <Button variant="Secondary" onClick={() => setIsClearStorageDialogOpen(true)}>
            Clear localStorage
          </Button>
          <Button variant="Secondary" onClick={resetFlags}>
            Reset flags
          </Button>
        </div>
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
  const { raceId } = useParams();
  const { openSnackbar } = useSnackbars();

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>Race</div>
      <div className={styles.buttonsRow}>
        <Button
          variant={"Secondary"}
          onClick={
            raceId
              ? () =>
                  downloadOffsetsForCurrentRace(raceId, () =>
                    openSnackbar({
                      title: "No offsets set for the current race",
                    }),
                  )
              : undefined
          }
          disabled={raceId == null}
        >
          Download offsets for current event
        </Button>
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
    </div>
  );
};
