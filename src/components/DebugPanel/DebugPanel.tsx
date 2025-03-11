import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { Dialog } from "../Dialog/Dialog";
import { DialogContent, DialogContentAlert, DialogContentButtonFooter } from "../Dialog/DialogContent/DialogContent";
import { Button } from "../Button/Button";
import { useSnackbars } from "../Snackbar/SnackbarsList.hooks";
import { useFeatureFlags } from "../../hooks/useFeatureFlags/useFeatureFlags";
import { storeLocalStorageClient } from "../../views/Viewer/hooks/useViewerState/useViewerState.utils";
import { getNewEventSnackbarData } from "../../views/Viewer/hooks/useNotifyAboutNewEvent/useNotifyAboutNewEvent.utils";
import { useFormulaImage } from "../../hooks/useFormulaImage/useFormulaImage";
import { SHORTCUTS } from "../../hooks/useHotkeys/useHotkeys.keys";
import { useHotkeys } from "../../hooks/useHotkeys/useHotkeys";
import { Checkbox } from "../Checkbox/Checkbox";
import { useTheme } from "../../hooks/useTheme/useTheme";
import styles from "./DebugPanel.module.scss";
import { debugStore, downloadOffsetsForCurrentRace, getLorem } from "./DebugPanel.utils";

export const DebugPanel = () => {
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);

  useHotkeys(
    () => ({
      id: "debug",
      allowPropagation: true,
      hotkeys: [
        {
          keys: SHORTCUTS.DEBUG,
          action: () => setIsDebugPanelOpen((d) => !d),
          preventDefault: true,
        },
        {
          keys: SHORTCUTS.CLOSE,
          enabled: isDebugPanelOpen,
          action: () => setIsDebugPanelOpen((d) => !d),
        },
      ],
    }),
    [isDebugPanelOpen],
  );

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
      <div className={styles.header}>
        <span>Debug options</span>
        <Button variant="Tertiary" iconLeft={XMarkIcon} onClick={props.closePanel} aria-label="Close" />
      </div>
      <DebugGeneralSection />
      <DebugColorModeSection />
      <DebugSnackbars />
      <DebugRaceSettings {...props} />
    </>
  );
};

const DebugSnackbars = () => {
  const { openSnackbar, closeSnackbar } = useSnackbars();
  const pictureUrl = useFormulaImage("1000007241-9dda9a2d-b17d-4b87-9432-3cab3171889e/landscape_hero_web", 360, 200);

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
              getNewEventSnackbarData("Weekend Warm-Up — Austria", "1000007241", pictureUrl, () => closeSnackbar(id)),
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
          <Button
            variant="Secondary"
            onClick={() => {
              throw new Error("Test Error");
            }}
          >
            Trigger error
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

const DebugColorModeSection = () => {
  const { setTheme, theme, displayedTheme } = useTheme();
  const toggleDarkMode = () => {
    setTheme(displayedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>Color Mode (Current: {theme})</div>
      <div className={styles.buttonsRow}>
        <Button variant="Secondary" onClick={() => setTheme("dark")}>
          Set Dark
        </Button>
        <Button variant="Secondary" onClick={() => setTheme("light")}>
          Set Light
        </Button>
        <Button variant="Secondary" onClick={() => setTheme("system")}>
          Set System
        </Button>
        <Button variant="Secondary" onClick={() => toggleDarkMode()}>
          Toggle
        </Button>
      </div>
    </div>
  );
};

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
            storeLocalStorageClient.set(debugStore);
            window.location.reload();
          }}
        >
          Load debug store
        </Button>
      </div>
      <Checkbox
        label="Increase background contrast"
        checked={flags.increaseBackgroundContrast}
        onChange={updateFlag("increaseBackgroundContrast")}
      />
      <Checkbox
        label="Show window borders"
        checked={flags.showWindowBorders}
        onChange={updateFlag("showWindowBorders")}
      />
      <Checkbox label="Never hide UI" checked={flags.forceUiVisibility} onChange={updateFlag("forceUiVisibility")} />
      <Checkbox
        label="Disable live notifications"
        checked={flags.disableLiveNotifications}
        onChange={updateFlag("disableLiveNotifications")}
      />
      <Checkbox
        label="Force F1 TV Access subscription"
        checked={flags.forceTVAccess}
        onChange={updateFlag("forceTVAccess")}
      />
      <Checkbox
        label="Show offset picker for International stream"
        checked={flags.showInternationalOffsets}
        onChange={updateFlag("showInternationalOffsets")}
      />
      <Checkbox label="Use kids avatars" checked={flags.useKidsAvatars} onChange={updateFlag("useKidsAvatars")} />
    </div>
  );
};
