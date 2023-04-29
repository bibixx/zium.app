type ClosedLayoutDialogState = {
  type: "closed";
};
type DeleteLayoutDialogState = {
  type: "delete";
  layoutName: string;
  onCancel: () => void;
};
type OverwriteLayoutDialogState = {
  type: "overwrite";
  layoutName: string;
  onCancel: () => void;
};
type SaveLayoutDialogState = {
  type: "save";
  initialLayoutName: string;
  onCancel: () => void;
};
type RenameLayoutDialogState = {
  type: "rename";
  initialLayoutName: string;
  onCancel: () => void;
};

export type LayoutDialogState =
  | ClosedLayoutDialogState
  | DeleteLayoutDialogState
  | OverwriteLayoutDialogState
  | SaveLayoutDialogState
  | RenameLayoutDialogState;
export type LayoutDialogType = LayoutDialogState["type"];
