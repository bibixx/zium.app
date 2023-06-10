import { useEffect, useMemo, useRef, useState } from "react";
import { Key } from "ts-key-enum";
import { useHotkeysStack } from "../../../hooks/useHotkeysStack/useHotkeysStack";
import { useLaggedBehindData } from "../../../hooks/useLaggedBehindData/useLaggedBehindData";
import { useScopedHotkeys } from "../../../hooks/useScopedHotkeys/useScopedHotkeys";
import { assertNever } from "../../../utils/assertNever";
import { quote } from "../../../utils/text";
import { Button } from "../../Button/Button";
import { Dialog } from "../../Dialog/Dialog";
import {
  DialogContent,
  DialogContentAlert,
  DialogContentButtonFooter,
  DialogContentCustom,
} from "../../Dialog/DialogContent/DialogContent";
import { Input } from "../../Input/Input";
import { LayoutDialogState } from "./LayoutDialogs.types";

interface LayoutDialogsProps {
  state: LayoutDialogState;
}
export const LayoutDialogs = ({ state }: LayoutDialogsProps) => {
  const isOpen = state.type !== "closed";
  const { data: laggedState, reset: resetLaggedState } = useLaggedBehindData(state, isOpen);

  const dialogContent = useMemo(() => {
    if (laggedState.type === "delete") {
      return (
        <DeleteDialog
          layoutName={laggedState.layoutName}
          onCancel={laggedState.onCancel}
          onConfirm={laggedState.onDelete}
        />
      );
    }

    if (laggedState.type === "duplicate") {
      return (
        <NameDialog
          initialLayoutName={laggedState.initialLayoutName}
          title={`Duplicate layout...`}
          onCancel={laggedState.onCancel}
          onSave={laggedState.onDuplicate}
          onSaveText="Duplicate"
          bannedNames={laggedState.bannedNames}
        />
      );
    }

    if (laggedState.type === "rename") {
      return (
        <NameDialog
          initialLayoutName={laggedState.initialLayoutName}
          title="Rename layout"
          onCancel={laggedState.onCancel}
          onSave={laggedState.onRename}
          onSaveText="Rename"
          bannedNames={laggedState.bannedNames}
        />
      );
    }

    if (laggedState.type === "closed") {
      return null;
    }

    return assertNever(laggedState);
  }, [laggedState]);

  const onClose = useMemo(() => {
    if (laggedState.type === "closed") {
      return () => undefined;
    }

    return laggedState.onCancel;
  }, [laggedState]);

  const scope = useHotkeysStack(isOpen, false);
  useScopedHotkeys(Key.Escape, scope, onClose, { enableOnFormTags: true });

  return (
    <Dialog isOpen={isOpen} onClose={onClose} onClosed={() => resetLaggedState()} width={400}>
      {dialogContent}
    </Dialog>
  );
};

interface DeleteDialogProps {
  layoutName: string;
  onCancel: () => void;
  onConfirm: () => void;
}
const DeleteDialog = ({ layoutName, onCancel, onConfirm }: DeleteDialogProps) => {
  return (
    <DialogContent>
      <DialogContentAlert
        title={`Delete ${quote(layoutName)}?`}
        subtitle={`If you delete ${quote(layoutName)} you won't be able to bring it back.`}
      />
      <DialogContentButtonFooter>
        <Button fluid variant="Secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button fluid variant="Primary" onClick={onConfirm}>
          Delete
        </Button>
      </DialogContentButtonFooter>
    </DialogContent>
  );
};

interface NameDialogProps {
  initialLayoutName: string;
  title: string;
  onSaveText: string;
  bannedNames: string[];
  onCancel: () => void;
  onSave: (name: string) => void;
}
const NameDialog = ({ initialLayoutName, title, onSaveText, onCancel, onSave, bannedNames }: NameDialogProps) => {
  const [newNameValue, setNewNameValue] = useState(initialLayoutName);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDisabled = newNameValue.trim() === "" || bannedNames.includes(newNameValue.trim());

  const internalOnSave = () => {
    if (isDisabled) {
      return;
    }

    onSave(newNameValue.trim());
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <DialogContent<"form">
      as="form"
      onSubmit={(e) => {
        e.preventDefault();
        internalOnSave();
      }}
    >
      <DialogContentCustom title={title}>
        <Input
          autoFocus
          value={newNameValue}
          placeholder="Layout name"
          onChange={(value) => setNewNameValue(value)}
          ref={inputRef}
        />
      </DialogContentCustom>
      <DialogContentButtonFooter>
        <Button fluid variant="Secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button fluid variant="Primary" disabled={isDisabled} type="submit">
          {onSaveText}
        </Button>
      </DialogContentButtonFooter>
    </DialogContent>
  );
};
