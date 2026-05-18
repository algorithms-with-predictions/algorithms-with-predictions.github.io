import { Typography, Tooltip } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { formatAuthors, getFullAuthorList } from '../../utils/paperUtils';

interface AuthorLineProps {
  authors?: string | string[] | undefined;
  sx?: SxProps<Theme>;
}

/**
 * Formatted author line component with truncation and tooltip
 */
const AuthorLine: React.FC<AuthorLineProps> = ({ authors, sx = {} }) => {
  const formattedAuthors = formatAuthors(authors);
  const fullAuthorList = getFullAuthorList(authors);

  // Show tooltip if authors are truncated
  const showTooltip = formattedAuthors !== fullAuthorList;

  const authorText = (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        fontSize: '0.8rem',
        lineHeight: 1.2,
        ...sx,
      }}
    >
      By {formattedAuthors}
    </Typography>
  );

  if (showTooltip) {
    return (
      <Tooltip title={fullAuthorList} placement="top" arrow>
        {authorText}
      </Tooltip>
    );
  }

  return authorText;
};

export default AuthorLine;
