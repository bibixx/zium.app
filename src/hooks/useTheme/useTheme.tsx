import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { LocalStorageClient } from "../../utils/localStorageClient";
import { useMediaQuery } from "../useMediaQuery/useMediaQuery";

const THEME_STORAGE_KEY = "theme";
const themeLocalStorageSchema = z.enum(["light", "dark"]);

class ThemeLocalStorageClient extends LocalStorageClient<typeof themeLocalStorageSchema, null> {
  constructor() {
    super(THEME_STORAGE_KEY, themeLocalStorageSchema, null);
  }

  get() {
    return "dark" as const;
  }
}

const themeLocalStorageClient = new ThemeLocalStorageClient();

type ThemeContextType = {
  theme: "light" | "dark" | "system";
  displayedTheme: "light" | "dark";
  setTheme: (theme: "light" | "dark" | "system") => void;
};
const ThemeContext = createContext<ThemeContextType | null>(null);
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }

  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeState, setThemeState] = useState<"light" | "dark">(
    // Initially defined in index.html
    document.documentElement.classList.contains("light") ? "light" : "dark",
  );
  const [isThemeSet, setIsThemeSet] = useState(themeLocalStorageClient.get() !== null);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const setThemeInternal = useCallback(
    (theme: "light" | "dark", setLocalStorage: boolean) => {
      document.documentElement.classList.add("noTransition");
      document.documentElement.classList.remove(themeState);
      document.documentElement.classList.add(theme);

      requestAnimationFrame(() => {
        document.documentElement.classList.remove("noTransition");
      });

      setThemeState(theme);

      if (setLocalStorage) {
        themeLocalStorageClient.set(theme);
        setIsThemeSet(true);
      }
    },
    [themeState],
  );

  const setTheme = useCallback(
    (theme: "light" | "dark" | "system") => {
      if (theme === "system") {
        setIsThemeSet(false);
        themeLocalStorageClient.remove();
      } else {
        setThemeInternal(theme, true);
      }
    },
    [setThemeInternal],
  );

  useEffect(() => {
    if (isThemeSet) {
      return;
    }

    if (prefersDarkMode) {
      setThemeInternal("dark", false);
    } else {
      setThemeInternal("light", false);
    }
  }, [isThemeSet, prefersDarkMode, setTheme, setThemeInternal]);

  useEffect(() => {
    const onStorageChange = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      const theme = themeLocalStorageClient.get();
      if (theme != null) {
        setThemeInternal(theme, false);
      }
    };

    window.addEventListener("storage", onStorageChange);

    return () => window.removeEventListener("storage", onStorageChange);
  }, [setThemeInternal]);

  const contextValue = useMemo(() => {
    const theme: "light" | "dark" | "system" = isThemeSet ? themeState : "system";
    return { theme, displayedTheme: themeState, setTheme };
  }, [isThemeSet, themeState, setTheme]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};
