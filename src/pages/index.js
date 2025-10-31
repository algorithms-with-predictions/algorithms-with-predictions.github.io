import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import '@fontsource/roboto/400.css';

import theme from '../theme';
import PaperList from '../components/paperlist';
import Layout from '../components/layout';
import data from '../../papers.json';

const IndexPage = () => {
  return (
    <div>
      <title>ALPS</title>
      <ThemeProvider theme={theme}>
        <Layout>
          <PaperList data={data} />
        </Layout>
      </ThemeProvider>
    </div>
  );
};

export default IndexPage;
