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
              content: generateTitle(),
            },
          },
        ],
      },
    },
    children: chunkText(transcription).map(createParagraphBlock),
  });
}

function chunkText(text, maxLength = 2000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.slice(i, i + maxLength));
  }
  return chunks;
}

function createParagraphBlock(text) {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: text } }],
    },
  };
}

function generateTitle() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[now.getDay()];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `Voice Note: ${dayName} ${hours}:${minutes}`;
}

module.exports = { createNote };
