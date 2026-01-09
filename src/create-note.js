const { Client } = require('@notionhq/client');
const config = require('./config');

async function createNote(transcription) {
  const notion = new Client({ auth: config.notion.token });

  await notion.pages.create({
    parent: { database_id: config.notion.databaseId },
    properties: {
      title: {
        title: [
          {
            text: {
              content: `Voice Note - ${new Date().toISOString()}`,
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
