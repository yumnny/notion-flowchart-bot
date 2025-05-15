const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

async function fetchDatabaseItems() {
  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  });
  return response.results;
}

async function updatePage(pageId, flowchartText) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Flowchart: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: flowchartText,
            },
          },
        ],
      },
    },
  });
}

function buildEdgesFromItem(name, nextRaw) {
  if (!nextRaw) return [];

  return nextRaw.split(',').map(target => {
    const to = target.trim();
    if (to.length === 0) return null;
    return `${name} --> ${to}`;
  }).filter(Boolean);
}

(async () => {
  const pages = await fetchDatabaseItems();

  let allEdges = [];

  pages.forEach(page => {
    const props = page.properties;
    const name = props.Name?.title?.[0]?.text?.content || '';
    const next = props.Next?.rich_text?.[0]?.text?.content || '';

    const edges = buildEdgesFromItem(name, next);
    allEdges.push(...edges);
  });

  const mermaidText = `\`\`\`mermaid\ngraph TD\n${allEdges.join('\n')}\n\`\`\``;

  for (const page of pages) {
    await updatePage(page.id, mermaidText);
  }

  console.log('✅ フローチャートを更新しました');
})();
