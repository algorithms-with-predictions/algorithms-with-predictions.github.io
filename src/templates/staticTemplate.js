/* eslint-disable react/prop-types */
import React from "react";
import { Container } from "@mui/material";
import { graphql } from "gatsby";
import "@fontsource/roboto/400.css";
import { ThemeProvider } from "@mui/material/styles";
import Layout from "../components/layout";
import theme from "../theme";

export default function Template({ data }) {
  const { markdownRemark } = data;
  const { frontmatter, html } = markdownRemark;
  return (
    <>
      <title>ALPS - {frontmatter.title}</title>
      <ThemeProvider theme={theme}>
        <Layout>
          <Container>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </Container>
        </Layout>
      </ThemeProvider>
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
