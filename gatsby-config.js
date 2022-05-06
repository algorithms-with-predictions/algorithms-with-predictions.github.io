module.exports = {
  siteMetadata: {
    title: `AlgorithmsWithPredictions`,
    siteUrl: `https://www.algorithms-with-predictions.github.io`
  },
  plugins: [
    `gatsby-plugin-emotion`, 
    `gatsby-plugin-material-ui`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `markdown-pages`,
        path: `${__dirname}/src/markdown-pages`,
      },
    },
    `gatsby-transformer-remark`,
  ],
};