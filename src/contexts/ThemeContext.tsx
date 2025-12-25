import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createCustomTheme, type ThemeMode } from '../theme';

/**
 * Theme context value
 */
interface ThemeContextValue {
  /** Current theme mode ('light' or 'dark') */
  mode: ThemeMode;
  /** Toggle between light and dark mode */
  toggleTheme: () => void;
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
 * Theme context provider component
 *
 * Features:
 * - Persists theme preference to localStorage
 * - Detects system theme preference on first visit
 * - SSR-safe with hydration handling (prevents mismatch)
 * - Provides MUI ThemeProvider with custom theme
 *
 * @param props - Provider props
 */
export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    setIsHydrated(true);

    // Only access browser APIs in client-side environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedMode = localStorage.getItem('themeMode');
      if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
        setMode(savedMode as ThemeMode);
      } else {
        // Detect system preference
        if (typeof window.matchMedia !== 'undefined') {
          const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches;
          setMode(prefersDark ? 'dark' : 'light');
        }
      }
    }
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

  const toggleTheme = (): void => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Use light theme during SSR and initial render to prevent hydration mismatch
  const effectiveMode: ThemeMode = isHydrated ? mode : 'light';
  const theme = createCustomTheme(effectiveMode);

  const value: ThemeContextValue = {
    mode: effectiveMode,
    toggleTheme,
    isDark: effectiveMode === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
