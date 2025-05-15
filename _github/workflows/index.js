const fs = require('fs');
const path = require('path');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.DATABASE_ID;
const CACHE_FILE = path.join(__dirname, 'last.json');

async function fetchDatabase() {
  const response = await notion.databases.query({ database_id: DATABASE_ID });
  return response.results.map(page => ({
    id: page.id,
    last_edited_time: page.last_edited_time,
  }));
}

async function generateFlowchart(data) {
  // フローチャート生成ロジックをここに入れる
  console.log('🧠 フローチャート再生成: ', new Date().toISOString());
}

async function main() {
  const latestData = await fetchDatabase();
  const latestJson = JSON.stringify(latestData, null, 2);

  let prevData = '';
  if (fs.existsSync(CACHE_FILE)) {
    prevData = fs.readFileSync(CACHE_FILE, 'utf-8');
  }

  if (prevData !== latestJson) {
    await generateFlowchart(latestData);
    fs.writeFileSync(CACHE_FILE, latestJson); // 状態を保存
  } else {
    console.log('✅ データ変更なし（スキップ）');
  }
}

main().catch(console.error);
