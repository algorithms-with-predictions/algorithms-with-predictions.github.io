import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import { formatAuthors } from '../../utils/paperUtils';

/**
 * Formatted author line component
 */
const AuthorLine = ({ authors, sx = {} }) => {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        fontSize: '0.8rem',
        lineHeight: 1.2,
        ...sx,
      }}
    >
      By {formatAuthors(authors)}
    </Typography>
  );
};

AuthorLine.propTypes = {
  authors: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  sx: PropTypes.object,
};

AuthorLine.defaultProps = {
  authors: null,
  sx: {},
};

export default AuthorLine;
