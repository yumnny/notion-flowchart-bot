const { Client } = require('@notionhq/client');
require('dotenv').config();
const fs = require('fs');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

// 例：ここでは flowchart.md を読み込んで記載
async function updatePage(pageId, flowchartText) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      'Flowchart': {
        rich_text: [
          {
            text: {
              content: flowchartText,
            },
          },
        ],
      },
    },
  });
}

async function run() {
  const flowchartText = fs.readFileSync('./flowchart.md', 'utf8');

  // ここは対象のページID（レコードのID）を指定
  const targetPageId = 'あなたのページID';
  await updatePage(targetPageId, flowchartText);
}

run().catch(console.error);
