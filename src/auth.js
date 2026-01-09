function checkAuthorization(headers) {
  const authHeader = headers.authorization;
  const expectedToken = process.env.AUTH_TOKEN;

  if (!expectedToken || !authHeader) {
    return false;
  }

  return authHeader === expectedToken;
}

module.exports = { checkAuthorization };
