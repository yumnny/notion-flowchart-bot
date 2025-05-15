const { Client } = require('@notionhq/client');
const fs = require('fs');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

async function generateFlowchart() {
  const response = await notion.databases.query({ database_id: databaseId });

  const pages = response.results;
  const edges = [];

  for (const page of pages) {
    const name = page.properties.Name?.title[0]?.plain_text || '';
    const next = page.properties.Next?.rich_text[0]?.plain_text || '';
    if (name && next) {
      next.split(',').map(n => n.trim()).forEach(to => {
        if (to) edges.push(`${name} --> ${to}`);
      });
    }
  }

  const mermaid = ['graph TD', ...edges].join('\n');

  // テンプレート読み込み
  const template = fs.readFileSync('public/template.html', 'utf-8');

  // 差し込み
  const html = template.replace('%%FLOWCHART_CODE%%', mermaid);

  // 書き込み
  fs.writeFileSync('public/index.html', html);
  console.log('✅ Flowchart updated and written to public/index.html');
}

generateFlowchart();
