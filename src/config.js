const { cleanEnv, str } = require('envalid');

const env = cleanEnv(process.env, {
  OPENAI_API_KEY: str(),
  AUTH_TOKEN: str(),
  NOTION_TOKEN: str(),
  NOTION_DATABASE_ID: str(),
});

const config = {
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
  auth: {
    token: env.AUTH_TOKEN,
  },
  notion: {
    token: env.NOTION_TOKEN,
    databaseId: env.NOTION_DATABASE_ID,
  },
};

module.exports = config;
