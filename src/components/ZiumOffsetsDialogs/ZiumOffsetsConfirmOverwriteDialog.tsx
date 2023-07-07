import { useState } from "react";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { Dialog } from "../Dialog/Dialog";
import { DialogContent, DialogContentAlert, DialogContentButtonFooter } from "../Dialog/DialogContent/DialogContent";
import { useHotkeys } from "../../hooks/useHotkeys/useHotkeys";
import { SHORTCUTS } from "../../hooks/useHotkeys/useHotkeys.keys";
import styles from "./ZiumOffsetsConfirmOverwriteDialog.module.scss";

interface ZiumOffsetsConfirmOverwriteDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onApply?: (dontAskForOverride: boolean) => void;
}

export const ZiumOffsetsConfirmOverwriteDialog = ({
  isOpen,
  onClose,
  onApply,
}: ZiumOffsetsConfirmOverwriteDialogProps) => {
  const [isDontShowAgainChecked, setIsDontShowAgainChecked] = useState(false);

  useHotkeys(
    () => ({
      allowPropagation: false,
      enabled: isOpen,
      hotkeys: [
        {
          keys: SHORTCUTS.CLOSE,
          action: () => onClose?.(),
        },
      ],
    }),
    [isOpen, onClose],
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose ?? (() => undefined)}
      width={400}
      onClosed={() => setIsDontShowAgainChecked(false)}
    >
      <DialogContent>
        <DialogContentAlert
          title="Override time offsets?"
          subtitle={
            <>
              <div>
                Time offsets for this session have been already defined by the Zium team. Are you sure you want to
                override them? You’ll be able to reset it later.
              </div>
              <div className={styles.checkboxWrapper}>
                <Checkbox
                  checked={isDontShowAgainChecked}
                  label="Don't show this again"
                  onChange={setIsDontShowAgainChecked}
                />
              </div>
            </>
          }
        />
        <DialogContentButtonFooter>
          <Button fluid variant="Secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button fluid variant="Primary" onClick={() => onApply?.(isDontShowAgainChecked)}>
            Override
          </Button>
        </DialogContentButtonFooter>
      </DialogContent>
    </Dialog>
  );
};
