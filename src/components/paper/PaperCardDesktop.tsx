import { memo, useMemo } from 'react';
import { Card, CardContent, Typography, Stack, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import LabelChip from './LabelChip';
import PublicationBadge from './PublicationBadge';
import AuthorLine from './AuthorLine';
import BibtexCopyButton from './BibtexCopyButton';
import { sortLabels } from '../../utils/labelUtils';
import { hasBibtex } from '../../utils/paperUtils';
import type { PaperCardProps } from './PaperCard';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 2,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  margin: 0,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[6],
    borderColor: theme.palette.primary.main,
    zIndex: 1,
  },
}));

const PaperTitle = styled(Typography)(() => ({
  fontWeight: 600,
  lineHeight: 1.1,
  fontSize: '1rem',
}));

/**
 * Desktop layout for PaperCard
 * - Title and labels inline on first row
 * - Publication badges and BibTeX button on the right
 * - Authors on second line
 */
const PaperCardDesktop: React.FC<PaperCardProps> = ({
  paper,
  selectedLabels = [],
  onLabelClick = null,
}) => {
  const sortedLabels = useMemo(() => sortLabels(paper.labels), [paper.labels]);

  const showBibtex = hasBibtex(paper.publications);

  return (
    <StyledCard>
      <CardContent sx={{ py: 0.5, px: 1, '&:last-child': { pb: 0.5 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box sx={{ flex: 1, pr: 1 }}>
            {/* Title and labels inline */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ flexWrap: 'wrap', gap: 0.5 }}
            >
              <PaperTitle variant="subtitle1" sx={{ display: 'inline', mb: 0 }}>
                {paper.title}
              </PaperTitle>

              {sortedLabels.map((label: string) => (
                <LabelChip
                  key={`label-${label}`}
                  label={label}
                  isSelected={selectedLabels.includes(label)}
                  onLabelClick={onLabelClick}
                  paperTitle={paper.title}
                />
              ))}
            </Stack>

            {/* Authors on second line */}
            <AuthorLine authors={paper.authors} />
          </Box>

          {/* Publication badges and BibTeX button on the right */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ flexShrink: 0 }}
          >
            {paper.publications?.map((pub, index: number) => (
              <PublicationBadge
                key={`pub-${index}`}
                publication={pub}
                paperTitle={paper.title}
              />
            ))}

            {showBibtex && (
              <BibtexCopyButton
                publications={paper.publications}
                paperTitle={paper.title}
              />
            )}
          </Stack>
        </Stack>
      </CardContent>
    </StyledCard>
  );
};

export default memo(PaperCardDesktop);
