/* eslint-disable react/prop-types */
import React from 'react';
import { Container } from '@mui/material';
import { graphql } from 'gatsby';
import '@fontsource/roboto/400.css';
import { ThemeContextProvider } from '../contexts/ThemeContext';
import Layout from '../components/layout';

export default function Template({ data }) {
  const { markdownRemark } = data;
  const { html } = markdownRemark;
  return (
    <ThemeContextProvider>
      <Layout>
        <Container>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </Container>
      </Layout>
    </ThemeContextProvider>
  );
}

export function Head({ data }) {
  const { markdownRemark } = data;
  const { frontmatter } = markdownRemark;
  const titleText = `ALPS - ${frontmatter.title}`;
  return <title>{titleText}</title>;
}

export const pageQuery = graphql`
  query ($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter {
        slug
        title
      }
    }
  }
`;
