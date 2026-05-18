import { Box, Typography, Button, Fade } from '@mui/material';
import {
  SearchOff as SearchOffIcon,
  FilterAltOff as FilterIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';

interface EmptyStateProps {
  variant: 'no-results' | 'no-filters' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Reusable empty state component with icons and animations
 * Provides friendly, helpful messaging when content is not available
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  variant,
  title,
  message,
  action,
}) => {
  const iconMap = {
    'no-results': SearchOffIcon,
    'no-filters': FilterIcon,
    error: ArticleIcon,
  };

  const Icon = iconMap[variant];

  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 3,
          textAlign: 'center',
        }}
      >
        {/* Icon with subtle pulse animation */}
        <Box
          sx={{
            mb: 3,
            color: 'text.secondary',
            opacity: 0.5,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.5 },
              '50%': { opacity: 0.3 },
            },
          }}
        >
          <Icon sx={{ fontSize: 80 }} />
        </Box>

        {/* Title */}
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>

        {/* Message */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 500, mb: 3 }}
        >
          {message}
        </Typography>

        {/* Optional action button */}
        {action && (
          <Button variant="outlined" size="large" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </Box>
    </Fade>
  );
};

export default EmptyState;
