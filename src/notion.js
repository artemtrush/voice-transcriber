const { Client } = require('@notionhq/client');
const config = require('./config');

const notionClient = new Client({ auth: config.notion.token });

async function createNote({ title, text }) {
  await notionClient.pages.create({
    parent: { database_id: config.notion.databaseId },
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
