const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

async function updateFlowcharts() {
  const response = await notion.databases.query({ database_id: databaseId });

  for (const page of response.results) {
    const nameProp = page.properties.Name?.title?.[0]?.plain_text || 'No Name';
    const id = page.id;

    const flowchart = `graph TD\n    ${nameProp} --> 処理A`;

    await notion.pages.update({
      page_id: id,
      properties: {
        Flowchart: {
          rich_text: [{ text: { content: flowchart } }],
        },
      },
    });
  }
}

updateFlowcharts().catch(console.error);
