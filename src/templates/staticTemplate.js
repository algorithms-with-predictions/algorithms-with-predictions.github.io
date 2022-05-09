/* eslint-disable react/prop-types */
import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import "@fontsource/roboto/400.css";
import { Container } from "@mui/material";

export default function Template({ data }) {
  const { markdownRemark } = data;
  const { frontmatter, html } = markdownRemark;
  return (
    <>
      <title>ALPS - {frontmatter.title}</title>
      <Layout>
        <Container>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </Container>
      </Layout>
    </>
  );
}

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter {
        slug
        title
      }
    }
  }
`;
