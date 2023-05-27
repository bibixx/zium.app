type ClosedLayoutDialogState = {
  type: "closed";
};
type DeleteLayoutDialogState = {
  type: "delete";
  layoutName: string;
  onCancel: () => void;
  onDelete: () => void;
};
type DuplicateLayoutDialogState = {
  type: "duplicate";
  bannedNames: string[];
  initialLayoutName: string;
  onCancel: () => void;
  onDuplicate: (name: string) => void;
};
type RenameLayoutDialogState = {
  type: "rename";
  bannedNames: string[];
  initialLayoutName: string;
  onCancel: () => void;
  onRename: (name: string) => void;
};

export type LayoutDialogState =
  | ClosedLayoutDialogState
  | DeleteLayoutDialogState
  | DuplicateLayoutDialogState
  | RenameLayoutDialogState;
export type LayoutDialogType = LayoutDialogState["type"];
