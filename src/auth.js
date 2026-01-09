function checkAuthorization(headers) {
  const authHeader = headers.authorization;
  const expectedToken = process.env.AUTH_TOKEN;

  if (!expectedToken) {
    console.warn('Authorization token not found in environment variables');
    return false;
  }

  return authHeader === expectedToken;
}

module.exports = { checkAuthorization };
