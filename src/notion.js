const { Client } = require('@notionhq/client');
const config = require('./config');

const notionClient = new Client({ auth: config.notion.token });

async function createNote(transcription) {
  await notionClient.pages.create({
    parent: { database_id: config.notion.databaseId },
    properties: {
      title: {
        title: [
          {
            text: {
              content: `Voice Note - ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
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
          rich_text: [
            {
              type: 'text',
              text: {
                content: transcription,
              },
            },
          ],
        },
      },
    ],
  });
}

module.exports = { createNote };
