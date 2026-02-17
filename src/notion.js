const { Client } = require('@notionhq/client');
const config = require('./config');

const notionClient = new Client({ auth: config.notion.token });

async function getDataSourceId() {
  const database = await notionClient.databases.retrieve({
    database_id: config.notion.databaseId,
  });

  return database.data_sources[0].id;
}

async function createNote({ title, text }) {
  const dataSourceId = await getDataSourceId();

  await notionClient.pages.create({
    parent: { type: 'data_source_id', data_source_id: dataSourceId },
    properties: {
      title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
    },
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: createTextChunks(text),
        },
      },
    ],
  });
}

function createTextChunks(text, maxLength = 2000) {
  const chunks = [];

  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push({ type: 'text', text: { content: text.slice(i, i + maxLength) } });
  }

  return chunks;
}

module.exports = { createNote };
