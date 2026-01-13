const { cleanEnv, str } = require('envalid');

const env = cleanEnv(process.env, {
  OPENAI_API_KEY: str(),

  NOTION_TOKEN: str(),
  NOTION_DATABASE_ID: str(),

  DROPBOX_ACCESS_TOKEN: str(),
  DROPBOX_APP_SECRET: str(),
  DROPBOX_FOLDER_PATH: str(),
});

const config = {
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
  notion: {
    token: env.NOTION_TOKEN,
    databaseId: env.NOTION_DATABASE_ID,
  },
  dropbox: {
    accessToken: env.DROPBOX_ACCESS_TOKEN,
    appSecret: env.DROPBOX_APP_SECRET,
    folderPath: env.DROPBOX_FOLDER_PATH,
  },
};

module.exports = config;
