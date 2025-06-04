const { override } = require('customize-cra');

module.exports = override(config => {
  // Use SHA-256 for Webpack hashing to avoid OpenSSL errors
  config.output.hashFunction = 'sha256';
  return config;
});