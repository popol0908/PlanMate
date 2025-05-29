module.exports = {
  webpack: {
    configure: (webpackConfig) => {

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
