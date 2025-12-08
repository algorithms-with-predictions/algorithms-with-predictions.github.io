import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LabelChip from '../LabelChip';

// Mock analytics
vi.mock('../../../utils/analytics', () => ({
  trackEvent: vi.fn(),
}));

const theme = createTheme({
  palette: {
    labels: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#fff',
    },
    typeLabels: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#fff',
    },
  },
});

const renderWithTheme = component => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('LabelChip', () => {
  it('renders label text', () => {
    renderWithTheme(<LabelChip label="online" />);
    expect(screen.getByText('online')).toBeInTheDocument();
  });

  it('renders as outlined when not selected', () => {
    renderWithTheme(<LabelChip label="test" isSelected={false} />);
    const chip = screen.getByText('test').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-outlined');
  });

  it('renders as filled when selected', () => {
    renderWithTheme(<LabelChip label="test" isSelected={true} />);
    const chip = screen.getByText('test').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-filled');
  });

  it('calls onLabelClick when clicked', () => {
    const handleClick = vi.fn();
    renderWithTheme(<LabelChip label="test" onLabelClick={handleClick} />);

    fireEvent.click(screen.getByText('test'));
    expect(handleClick).toHaveBeenCalledWith('test');
  });

  it('does not crash when clicked without onLabelClick', () => {
    renderWithTheme(<LabelChip label="test" />);
    expect(() => fireEvent.click(screen.getByText('test'))).not.toThrow();
  });

  it('is clickable', () => {
    renderWithTheme(<LabelChip label="test" />);
    const chip = screen.getByText('test').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-clickable');
  });
});
