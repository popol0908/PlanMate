module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallback for Node.js core modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        util: require.resolve('util/'),
        process: require.resolve('process/browser')
      };
      return webpackConfig;
    }
  }
};
