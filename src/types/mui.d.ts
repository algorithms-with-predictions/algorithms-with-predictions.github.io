/**
 * Module augmentation for Material-UI theme to add custom palette colors
 * This file extends MUI's Palette interface to recognize custom theme properties
 */

import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    /** Color palette for paper labels */
    labels: Palette['primary'];
    /** Color palette for type labels (special category labels) */
    typeLabels: Palette['primary'];
    /** Color palette for links */
    link: {
      main: string;
      hover: string;
      visited: string;
    };
  }

  interface PaletteOptions {
    /** Color palette for paper labels */
    labels?: PaletteOptions['primary'];
    /** Color palette for type labels (special category labels) */
    typeLabels?: PaletteOptions['primary'];
    /** Color palette for links */
    link?: {
      main: string;
      hover: string;
      visited: string;
    };
  }
}
