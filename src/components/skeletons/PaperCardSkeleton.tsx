import { Card, CardContent, Stack, Skeleton, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 2,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  margin: 0,
  marginBottom: theme.spacing(1),
}));

/**
 * Skeleton loading state for PaperCard
 * Matches the layout of actual paper cards to reduce perceived loading time
 */
const PaperCardSkeleton: React.FC = () => (
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
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="rounded" width={80} height={24} />
            <Skeleton variant="rounded" width={100} height={24} />
            <Skeleton variant="rounded" width={70} height={24} />
          </Stack>

          {/* Authors on second line */}
          <Skeleton variant="text" width="45%" height={20} />
        </Box>

        {/* Publication badges and BibTeX button on the right */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ flexShrink: 0 }}
        >
          <Skeleton variant="rounded" width={80} height={28} />
          <Skeleton variant="rounded" width={32} height={32} />
        </Stack>
      </Stack>
    </CardContent>
  </StyledCard>
);

export default PaperCardSkeleton;
