const fs = require('fs').promises;
const path = require('path');
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

async function getFlowchartCode() {
  const response = await notion.databases.query({ database_id: databaseId });
  if (!response.results.length) {
    console.log('データベースにアイテムがありません。');
    return 'graph TD\nNo data found';
  }
  const page = response.results[0];
  const flowchartProp = page.properties.Flowchart;
  if (!flowchartProp || !flowchartProp.rich_text.length) {
    console.log('Flowchartプロパティが空です。');
    return 'graph TD\nNo flowchart data';
  }
  const flowchartCode = flowchartProp.rich_text.map(t => t.plain_text).join('\n');
  return flowchartCode;
}

async function updateHtml(flowchartCode) {
  const htmlPath = path.join(process.cwd(), 'public', 'index.html');
  let html = await fs.readFile(htmlPath, 'utf-8');
  html = html.replace('%%FLOWCHART_CODE%%', flowchartCode);
  await fs.writeFile(htmlPath, html, 'utf-8');
  console.log('public/index.html を更新しました。');
}

async function main() {
  try {
    const flowchartCode = await getFlowchartCode();
    await updateHtml(flowchartCode);
  } catch (error) {
    console.error('エラー:', error);
  }
}

main();
