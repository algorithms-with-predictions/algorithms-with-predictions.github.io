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
  borderRadius: 4,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'inset 3px 0 0 transparent',
  transition:
    'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  margin: 0,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.mode === 'dark' ? '#1d1f1f' : '#fffdf6',
    boxShadow: `inset 3px 0 0 ${theme.palette.primary.main}`,
  },
}));

const PaperTitle = styled(Typography)(() => ({
  fontWeight: 700,
  lineHeight: 1.25,
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
      <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box sx={{ flex: 1 }}>
            {/* Title and labels inline */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}
            >
              <PaperTitle
                variant="subtitle1"
                sx={{
                  display: 'inline',
                  mb: 0,
                  fontWeight: 700,
                  lineHeight: 1.25,
                }}
              >
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
