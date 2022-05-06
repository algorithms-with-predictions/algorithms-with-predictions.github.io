import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import "@fontsource/roboto/400.css";

export default function Template({ data }) {
  const { markdownRemark } = data; // data.markdownRemark holds our post data
  const { html } = markdownRemark;
  return (
    <Layout>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Layout>
  );
}

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter {
        slug
      }
    }
  }
`;
