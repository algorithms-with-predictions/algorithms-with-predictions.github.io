import * as React from 'react';
import '@fontsource/roboto/400.css';

import { ThemeContextProvider } from '../contexts/ThemeContext';
import PaperList from '../components/paperlist';
import Layout from '../components/layout';
import data from '../../papers.json';

const IndexPage = () => {
  return (
    <ThemeContextProvider>
      <Layout>
        <PaperList data={data} />
      </Layout>
    </ThemeContextProvider>
  );
};

export default IndexPage;

export function Head() {
  return <title>ALPS</title>;
}
