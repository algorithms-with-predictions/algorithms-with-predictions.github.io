import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  createCustomTheme,
  type ThemeMode,
  type ResolvedThemeMode,
} from '../theme';

/**
 * Theme context value
 */
interface ThemeContextValue {
  /** Current theme mode preference ('light', 'dark', or 'system') */
  mode: ThemeMode;
  /** Resolved theme mode ('light' or 'dark') - what's actually displayed */
  resolvedMode: ResolvedThemeMode;
  /** Cycle through theme modes: light → dark → system → light */
  cycleTheme: () => void;
  /** Whether dark mode is active */
  isDark: boolean;
}

/**
 * Theme context (use useThemeMode hook to access)
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Hook to access theme mode and toggle function
 *
 * Must be used within a ThemeContextProvider
 *
 * @returns Theme context value with mode, toggleTheme, and isDark
 * @throws Error if used outside ThemeContextProvider
 */
export const useThemeMode = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeContextProvider');
  }
  return context;
};

/**
 * Props for ThemeContextProvider
 */
interface ThemeContextProviderProps {
  children: ReactNode;
}

/**
 * Get system color scheme preference
 */
const getSystemPreference = (): ResolvedThemeMode => {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia !== 'undefined'
  ) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
};

/**
 * Resolve theme mode to actual light/dark value
 */
const resolveThemeMode = (
  mode: ThemeMode,
  systemPreference: ResolvedThemeMode
): ResolvedThemeMode => {
  if (mode === 'system') {
    return systemPreference;
  }
  return mode;
};

/**
 * Theme context provider component
 *
 * Features:
 * - Persists theme preference to localStorage
 * - Supports system mode that follows OS preference
 * - Listens for system preference changes when in system mode
 * - SSR-safe with hydration handling (prevents mismatch)
 * - Provides MUI ThemeProvider with custom theme
 *
 * @param props - Provider props
 */
export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [systemPreference, setSystemPreference] =
    useState<ResolvedThemeMode>('light');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved theme preference and detect system preference on mount
  useEffect(() => {
    setIsHydrated(true);

    // Detect current system preference
    setSystemPreference(getSystemPreference());

    // Load saved preference from localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedMode = localStorage.getItem('themeMode');
      if (
        savedMode &&
        (savedMode === 'light' ||
          savedMode === 'dark' ||
          savedMode === 'system')
      ) {
        setMode(savedMode as ThemeMode);
      }
      // Default to 'system' if no saved preference (already set as initial state)
    }
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia === 'undefined'
    ) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save theme preference when changed (only after hydration)
  useEffect(() => {
    if (
      isHydrated &&
      typeof window !== 'undefined' &&
      typeof localStorage !== 'undefined'
    ) {
      localStorage.setItem('themeMode', mode);
    }
  }, [mode, isHydrated]);

  const cycleTheme = useCallback((): void => {
    setMode(prevMode => {
      switch (prevMode) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'system';
        case 'system':
          return 'light';
        default:
          return 'light';
      }
    });
  }, []);

  // Use light theme during SSR and initial render to prevent hydration mismatch
  const effectiveSystemPreference: ResolvedThemeMode = isHydrated
    ? systemPreference
    : 'light';
  const effectiveMode: ThemeMode = isHydrated ? mode : 'system';
  const resolvedMode = resolveThemeMode(
    effectiveMode,
    effectiveSystemPreference
  );
  const theme = createCustomTheme(resolvedMode);

  const value: ThemeContextValue = {
    mode: effectiveMode,
    resolvedMode,
    cycleTheme,
    isDark: resolvedMode === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
