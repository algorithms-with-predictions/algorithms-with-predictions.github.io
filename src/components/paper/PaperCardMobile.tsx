import { memo, useMemo } from 'react';
import { Card, CardContent, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import LabelChip from './LabelChip';
import PublicationBadge from './PublicationBadge';
import AuthorLine from './AuthorLine';
import { sortLabels } from '../../utils/labelUtils';
import type { PaperCardProps } from './PaperCard';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 2,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  margin: 0,
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

const PaperTitle = styled(Typography)(() => ({
  fontWeight: 600,
  lineHeight: 1.1,
  fontSize: '1rem',
}));

/**
 * Mobile layout for PaperCard
 * - Title on first row
 * - Authors on second row
 * - Labels and publication badges wrapped together
 */
const PaperCardMobile: React.FC<PaperCardProps> = ({
  paper,
  selectedLabels = [],
  onLabelClick = null,
}) => {
  const sortedLabels = useMemo(() => sortLabels(paper.labels), [paper.labels]);

  return (
    <StyledCard>
      <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
        {/* Title */}
        <PaperTitle
          variant="subtitle1"
          sx={{
            display: 'block',
            mb: 0.75,
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {paper.title}
        </PaperTitle>

        {/* Authors */}
        <AuthorLine authors={paper.authors} sx={{ display: 'block', mb: 1 }} />

        {/* Labels and publication badges wrapped together */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{
            flexWrap: 'wrap',
            gap: 0.75,
            '& > *': {
              minHeight: '32px', // Ensure adequate touch targets
            },
          }}
        >
          {/* Topic labels */}
          {sortedLabels.map((label: string) => (
            <LabelChip
              key={`label-${label}`}
              label={label}
              isSelected={selectedLabels.includes(label)}
              onLabelClick={onLabelClick}
              paperTitle={paper.title}
            />
          ))}

          {/* Publication badges inline with labels */}
          {paper.publications?.map((pub, index: number) => (
            <PublicationBadge
              key={`pub-${index}`}
              publication={pub}
              paperTitle={paper.title}
            />
          ))}
        </Stack>
      </CardContent>
    </StyledCard>
  );
};

export default memo(PaperCardMobile);
