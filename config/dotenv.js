module.exports = function(env) { // eslint-disable-line no-unused-vars
  return {
    clientAllowedKeys: [],
    // Fail build when there is missing any of clientAllowedKeys environment variables.
    // By default false.
    failOnMissingKey: false, 
  };
};
