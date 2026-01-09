const { Client } = require('@notionhq/client');

async function createNote(transcription) {
  const notionToken = process.env.NOTION_TOKEN;
  const notionDatabaseId = process.env.NOTION_DATABASE_ID;

  if (!notionToken || !notionDatabaseId) {
    throw new Error('NOTION_TOKEN and NOTION_DATABASE_ID environment variables are required');
  }

  const notion = new Client({ auth: notionToken });

  await notion.pages.create({
    parent: { database_id: notionDatabaseId },
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

  console.log('Note created successfully');
}

module.exports = { createNote };
