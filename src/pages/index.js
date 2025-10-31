import * as React from 'react';
import '@fontsource/roboto/400.css';

import { ThemeContextProvider } from '../contexts/ThemeContext';
import PaperList from '../components/paperlist';
import Layout from '../components/layout';
import data from '../../papers.json';

const IndexPage = () => {
  return (
    <div>
      <title>ALPS</title>
      <ThemeContextProvider>
        <Layout>
          <PaperList data={data} />
        </Layout>
      </ThemeContextProvider>
    </div>
  );
};

export default IndexPage;
