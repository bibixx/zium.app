type ClosedLayoutDialogState = {
  type: "closed";
};
type DeleteLayoutDialogState = {
  type: "delete";
  layoutName: string;
  onCancel: () => void;
  onDelete: () => void;
};
type OverwriteLayoutDialogState = {
  type: "overwrite";
  layoutName: string;
  onCancel: () => void;
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
  | OverwriteLayoutDialogState
  | DuplicateLayoutDialogState
  | RenameLayoutDialogState;
export type LayoutDialogType = LayoutDialogState["type"];
