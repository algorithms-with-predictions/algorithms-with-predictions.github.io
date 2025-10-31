import { Container } from '@mui/material';
import * as React from 'react';
import PropTypes from 'prop-types';
import Header from './header';

import './layout.css';

const Layout = ({ children }) => (
  <>
    <Header />
    <div>
      <main>
        <Container maxWidth="None">{children}</Container>
      </main>
    </div>
  </>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
