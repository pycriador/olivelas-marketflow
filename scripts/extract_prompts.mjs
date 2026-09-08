import fs from 'fs';
import readline from 'readline';

const filePath = 'C:/Users/willi/.gemini/antigravity/brain/6e99fd2c-9bb3-4474-b709-71d9a96e8d94/.system_generated/logs/transcript.jsonl';
if (!fs.existsSync(filePath)) {
  console.log('Arquivo de transcript não encontrado:', filePath);
  process.exit(0);
}

const fileStream = fs.createReadStream(filePath);
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

let idx = 1;
for await (const line of rl) {
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT') {
      console.log(`=== USER_INPUT #${idx} ===`);
      console.log(`Timestamp: ${data.created_at || 'N/A'}`);
      console.log(`Content:\n${data.content}\n`);
      idx++;
    }
  } catch (e) {}
}
