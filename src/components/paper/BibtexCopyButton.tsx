import { useState } from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';
import { trackEvent } from '../../utils/analytics';
import { getBibtexEntries, getMainPublication } from '../../utils/paperUtils';
import type { Publication } from '@/types/paper';

interface BibtexCopyButtonProps {
  publications?: Publication[] | undefined;
  paperTitle?: string | undefined;
  size?: 'small' | 'medium' | 'large';
}

/**
 * BibTeX copy button with analytics tracking and success animation
 */
const BibtexCopyButton: React.FC<BibtexCopyButtonProps> = ({
  publications = [],
  paperTitle = '',
  size = 'small',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyBibtex = (): void => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    const bibtexEntries = getBibtexEntries(publications);

    if (bibtexEntries) {
      void navigator.clipboard?.writeText(bibtexEntries).then(() => {
        setCopied(true);

        const mainPublication = getMainPublication(publications);
        trackEvent('bibtex_copy', {
          category: 'paper_interaction',
          label: paperTitle || 'Unknown paper',
          custom_parameter_1: mainPublication?.name || 'unknown_venue',
        });

        // Reset after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <Tooltip title={copied ? 'Copied!' : 'Copy BibTeX'}>
      <IconButton
        onClick={handleCopyBibtex}
        size={size}
        sx={{
          p: 0.5,
          transition: 'all 0.3s ease',
          ...(copied && {
            color: 'success.main',
            backgroundColor: 'success.light',
            '&:hover': {
              backgroundColor: 'success.light',
            },
          }),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            transition: 'all 0.3s ease',
          }}
        >
          {copied ? (
            <Check sx={{ fontSize: size === 'small' ? 18 : 24 }} />
          ) : (
            <ContentCopy sx={{ fontSize: size === 'small' ? 18 : 24 }} />
          )}
        </Box>
      </IconButton>
    </Tooltip>
  );
};

export default BibtexCopyButton;
