import { Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { formatAuthors } from '../../utils/paperUtils';

interface AuthorLineProps {
  authors?: string | string[] | undefined;
  sx?: SxProps<Theme>;
}

/**
 * Formatted author line component
 */
const AuthorLine: React.FC<AuthorLineProps> = ({ authors, sx = {} }) => {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        fontSize: '0.8rem',
        lineHeight: 1.2,
        ...sx,
      }}
    >
      By {formatAuthors(authors)}
    </Typography>
  );
};

export default AuthorLine;
