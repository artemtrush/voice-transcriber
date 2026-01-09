const config = require('./config');

function checkAuthorization(headers) {
  const authHeader = headers.authorization;
  const expectedToken = config.auth.token;

  return authHeader === expectedToken;
}

module.exports = { checkAuthorization };
