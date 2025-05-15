const { Client } = require('@notionhq/client');
const fs = require('fs');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

async function generateFlowchart() {
  const response = await notion.databases.query({ database_id: databaseId });

  const pages = response.results;
  const nodes = [];
  const edges = [];

  for (const page of pages) {
    const name = page.properties.Name?.title[0]?.plain_text || '';
    const next = page.properties.Next?.rich_text[0]?.plain_text || '';
    if (name) nodes.push(name);
    if (name && next) {
      next.split(',').map(n => n.trim()).forEach(to => {
        if (to) edges.push(`${name} --> ${to}`);
      });
    }
  }

  const mermaid = ['graph TD', ...edges].join('\n');

  // HTMLファイルに出力
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
      mermaid.initialize({ startOnLoad: true });
    </script>
  </head>
  <body>
    <div class="mermaid">
${mermaid}
    </div>
  </body>
</html>`;

  fs.writeFileSync('public/index.html', html);
  console.log('✅ index.html updated with Mermaid flowchart');
}

generateFlowchart();
