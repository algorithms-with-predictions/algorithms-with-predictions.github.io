// Example: MUI + Tailwind-style utilities approach
// You could add this to your project later if needed

import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

// Create utility-style components with MUI
export const FlexCenter = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const GridAuto = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1rem',
});

// Usage: <FlexCenter>Content</FlexCenter>
// Similar to Tailwind's flex items-center justify-center
