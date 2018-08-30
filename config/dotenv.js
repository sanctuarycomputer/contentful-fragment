module.exports = function(env) {
  return {
    clientAllowedKeys: [],
    // Fail build when there is missing any of clientAllowedKeys environment variables.
    // By default false.
    failOnMissingKey: false, 
  };
};
