import { IconButton, Tooltip } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { trackEvent } from '../../utils/analytics';
import { getBibtexEntries, getMainPublication } from '../../utils/paperUtils';
import type { Publication } from '@/types/paper';

interface BibtexCopyButtonProps {
  publications?: Publication[] | undefined;
  paperTitle?: string | undefined;
  size?: 'small' | 'medium' | 'large';
}

/**
 * BibTeX copy button with analytics tracking
 */
const BibtexCopyButton: React.FC<BibtexCopyButtonProps> = ({
  publications = [],
  paperTitle = '',
  size = 'small',
}) => {
  const handleCopyBibtex = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    const bibtexEntries = getBibtexEntries(publications);

    if (bibtexEntries) {
      void navigator.clipboard?.writeText(bibtexEntries);
      const mainPublication = getMainPublication(publications);
      trackEvent('bibtex_copy', {
        category: 'paper_interaction',
        label: paperTitle || 'Unknown paper',
        custom_parameter_1: mainPublication?.name || 'unknown_venue',
      });
    }
  };

  return (
    <Tooltip title="Copy BibTeX">
      <IconButton
        onClick={handleCopyBibtex}
        size={size}
        color="primary"
        sx={{ p: 0.5 }}
      >
        <ContentCopy sx={{ fontSize: size === 'small' ? 18 : 24 }} />
      </IconButton>
    </Tooltip>
  );
};

export default BibtexCopyButton;
