import { IconButton, Tooltip } from '@mui/material';
import {
  Brightness4,
  Brightness7,
  SettingsBrightness,
} from '@mui/icons-material';
import { useThemeMode } from '../contexts/ThemeContext';

const getNextMode = (mode: 'light' | 'dark' | 'system'): string => {
  switch (mode) {
    case 'light':
      return 'dark';
    case 'dark':
      return 'system';
    case 'system':
      return 'light';
    default:
      return 'dark';
  }
};

const getModeIcon = (mode: 'light' | 'dark' | 'system'): React.ReactNode => {
  switch (mode) {
    case 'light':
      return <Brightness7 />;
    case 'dark':
      return <Brightness4 />;
    case 'system':
      return <SettingsBrightness />;
    default:
      return <Brightness7 />;
  }
};

const ThemeToggle: React.FC = () => {
  const { mode, cycleTheme } = useThemeMode();
  const nextMode = getNextMode(mode);

  return (
    <Tooltip title={`${mode} mode (click for ${nextMode})`}>
      <IconButton
        onClick={cycleTheme}
        color="inherit"
        sx={{
          ml: 1,
          color: 'text.secondary',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          transition: 'background-color 0.2s ease, color 0.2s ease',
          '&:hover': {
            color: 'primary.dark',
            bgcolor: 'primary.light',
          },
        }}
        aria-label={`Current: ${mode} mode. Switch to ${nextMode} mode`}
      >
        {getModeIcon(mode)}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
