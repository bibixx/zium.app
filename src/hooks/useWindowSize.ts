import { useCallback, useEffect, useRef, useState } from "react";

interface WindowSize {
  width: number;
  height: number;
}

export const useWindowSizeBase = (onChange: (state: WindowSize) => void) => {
  useEffect(() => {
    const onResize = () => {
      onChange({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onChange]);
};

export const useWindowSize = () => {
  const [state, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useWindowSizeBase(setWindowSize);

  return state;
};

export const useWindowSizeRef = () => {
  const state = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useWindowSizeBase(
    useCallback((newState) => {
      state.current = newState;
    }, []),
  );

  return state;
};
