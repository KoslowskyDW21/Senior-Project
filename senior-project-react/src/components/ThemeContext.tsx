import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";

type ThemeMode = "auto" | "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useThemeContext must be used within a ThemeProvider");
  return context;
};

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const getInitialMode = (): ThemeMode => {
    const stored = localStorage.getItem("themeMode") as ThemeMode | null;
    return stored ?? "auto";
  };

  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Calculate isDarkMode based on mode and system preference
  const isDarkMode = useMemo(() => {
    if (mode === "dark") return true;
    if (mode === "light") return false;
    return systemPrefersDark;
  }, [mode, systemPrefersDark]);

  // Persist to localStorage and update mode state
  const setMode = (newMode: ThemeMode) => {
    localStorage.setItem("themeMode", newMode);
    setModeState(newMode);
  };

  // Listen to system preference changes if in auto mode
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, setMode, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
