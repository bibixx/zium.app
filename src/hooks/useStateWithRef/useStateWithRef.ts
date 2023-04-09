import { useCallback, useRef, useState } from "react";

export const useStateWithRef = <T>(initialState: T) => {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(initialState);

  const update = useCallback((newState: T) => {
    setState(newState);
    stateRef.current = newState;
  }, []);

  return [state, stateRef, update] as const;
};
