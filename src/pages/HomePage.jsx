import React from 'react';
import PaperList from '../components/paperlist.jsx';
import data from '../../papers.json';

const HomePage = () => {
  return <PaperList data={data} />;
};

export default HomePage;
