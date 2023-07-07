import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import {
  DialogContent,
  DialogContentButtonFooter,
  DialogContentInformation,
} from "../Dialog/DialogContent/DialogContent";

interface ZiumOffsetsOverwriteOnStartDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onApply?: () => void;
}

export const ZiumOffsetsOverwriteOnStartDialog = ({
  isOpen,
  onClose = () => undefined,
  onApply,
}: ZiumOffsetsOverwriteOnStartDialogProps) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} width={400}>
      <DialogContent>
        <DialogContentInformation
          title="Update time offsets?"
          subtitle="We have updated time offsets for this session. Would you like to load them?"
        />
        <DialogContentButtonFooter>
          <Button fluid variant="Secondary" onClick={onClose}>
            Dismiss
          </Button>
          <Button fluid variant="Primary" onClick={onApply}>
            Update
          </Button>
        </DialogContentButtonFooter>
      </DialogContent>
    </Dialog>
  );
};
