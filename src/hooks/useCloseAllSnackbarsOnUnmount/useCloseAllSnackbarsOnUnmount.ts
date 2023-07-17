import { useCallback, useEffect, useRef } from "react";
import { useSnackbars } from "../../components/Snackbar/SnackbarsList.hooks";

export const useCloseAllSnackbarsOnUnmount = () => {
  const { closeSnackbar } = useSnackbars();
  const snackbarIds = useRef<string[]>([]);

  const registerSnackbar = useCallback((snackbarId: string) => {
    snackbarIds.current.push(snackbarId);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => snackbarIds.current.forEach((snackbarId) => closeSnackbar(snackbarId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return registerSnackbar;
};
