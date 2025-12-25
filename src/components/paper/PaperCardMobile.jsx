import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import LabelChip from './LabelChip';
import PublicationBadge from './PublicationBadge';
import AuthorLine from './AuthorLine';
import { sortLabels } from '../../utils/labelUtils';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 2,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  margin: 0,
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
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
 * Mobile layout for PaperCard
 * - Title on first row
 * - Authors on second row
 * - Labels and publication badges wrapped together
 */
const PaperCardMobile = ({
  paper,
  selectedLabels = [],
  onLabelClick = null,
}) => {
  const sortedLabels = React.useMemo(
    () => sortLabels(paper.labels),
    [paper.labels]
  );

  return (
    <StyledCard>
      <CardContent sx={{ py: 0.5, px: 1, '&:last-child': { pb: 0.5 } }}>
        {/* Title */}
        <PaperTitle
          variant="subtitle1"
          component="h3"
          sx={{ display: 'block', mb: 0.25 }}
        >
          {paper.title}
        </PaperTitle>

        {/* Authors */}
        <AuthorLine
          authors={paper.authors}
          sx={{ display: 'block', mb: 0.5 }}
        />

        {/* Labels and publication badges wrapped together */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ flexWrap: 'wrap', gap: 0.5 }}
        >
          {/* Topic labels */}
          {sortedLabels.map(label => (
            <LabelChip
              key={`label-${label}`}
              label={label}
              isSelected={selectedLabels.includes(label)}
              onLabelClick={onLabelClick}
              paperTitle={paper.title}
            />
          ))}

          {/* Publication badges inline with labels */}
          {paper.publications?.map((pub, index) => (
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

PaperCardMobile.propTypes = {
  paper: PropTypes.shape({
    title: PropTypes.string,
    authors: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    labels: PropTypes.arrayOf(PropTypes.string),
    publications: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        year: PropTypes.number,
        url: PropTypes.string,
        bibtex: PropTypes.string,
      })
    ),
  }).isRequired,
  selectedLabels: PropTypes.arrayOf(PropTypes.string),
  onLabelClick: PropTypes.func,
};

export default memo(PaperCardMobile);
