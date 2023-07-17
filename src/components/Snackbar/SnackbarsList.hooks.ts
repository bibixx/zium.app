import { createRef, MutableRefObject, ReactNode, useMemo } from "react";
import { create } from "zustand";
import { generateUID } from "../../utils/generateUID";

export interface SnackbarData {
  id: string;
  title: ReactNode;
  content?: ReactNode;
  actions?: ReactNode;
  time?: number;
  image?: string;
  nodeRef: MutableRefObject<HTMLElement | undefined>;
}

export type ArgumentSnackbarData = Omit<SnackbarData, "id" | "nodeRef"> & { id?: string };

interface SnackbarStore {
  snackbars: SnackbarData[];
  openSnackbar: (snackbar: ArgumentSnackbarData) => string;
  closeSnackbar: (snackbarId: string) => void;
}

export const useSnackbarsState = create<SnackbarStore>((set) => ({
  snackbars: [],
  openSnackbar: (snackbar) => {
    const snackbarId = snackbar.id ?? generateUID();

    set((state) => {
      const snackbars = state.snackbars;
      const alreadyExistingSnackbarIndex = snackbars.findIndex(({ id }) => id === snackbarId);
      const newSnackbar = { ...snackbar, id: snackbarId, nodeRef: createMutableRef<HTMLElement | undefined>() };

      if (alreadyExistingSnackbarIndex >= 0) {
        return {
          snackbars: [
            ...snackbars.slice(0, alreadyExistingSnackbarIndex),
            newSnackbar,
            ...snackbars.slice(alreadyExistingSnackbarIndex + 1),
          ],
        };
      }

      return { snackbars: [...snackbars, newSnackbar] };
    });

    return snackbarId;
  },
  closeSnackbar: (snackbarId) => {
    set((state) => ({ snackbars: state.snackbars.filter(({ id }) => id !== snackbarId) }));
  },
}));

export const useSnackbars = () => {
  const openSnackbar = useSnackbarsState((state) => state.openSnackbar);
  const closeSnackbar = useSnackbarsState((state) => state.closeSnackbar);

  return useMemo(() => ({ closeSnackbar, openSnackbar }), [closeSnackbar, openSnackbar]);
};

function createMutableRef<T>() {
  return createRef<T>() as MutableRefObject<T>;
}
