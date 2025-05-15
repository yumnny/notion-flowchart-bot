const { Client } = require('@notionhq/client');
const fs = require('fs');

// Notion クライアントの初期化
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

(async () => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    const pages = response.results;
    const edges = [];

    for (const page of pages) {
      const props = page.properties;

      const from = props.Name?.title?.[0]?.plain_text;
      const nextRaw = props.Next?.rich_text?.[0]?.plain_text;

      if (!from || !nextRaw) continue;

      const nextNodes = nextRaw.split(',').map(n => n.trim());

      for (const to of nextNodes) {
        if (to) edges.push(`${from} --> ${to}`);
      }
    }

    const mermaid = `graph TD\n${edges.join('\n')}`;

    console.log('Generated Mermaid:\n', mermaid);

    // Notion に戻す
    for (const page of pages) {
      await notion.pages.update({
        page_id: page.id,
        properties: {
          Flowchart: {
            rich_text: [
              {
                text: {
                  content: mermaid,
                },
              },
            ],
          },
        },
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
})();
