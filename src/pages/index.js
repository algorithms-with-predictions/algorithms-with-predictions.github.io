import * as React from "react";
import PaperList from "../components/paperlist";
import Layout from "../components/layout";
import "@fontsource/roboto/400.css";

import data from "../../content/papers.json";

const IndexPage = () => {
  return (
    <div>
      <title>ALPS</title>
      <Layout>
        <PaperList data={data} />
      </Layout>
    </div>
  );
};

export default IndexPage;
