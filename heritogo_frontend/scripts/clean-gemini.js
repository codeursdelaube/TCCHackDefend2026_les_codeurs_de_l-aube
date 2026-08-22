const fs = require('fs');
const path = require('path');

const messagesDir = path.resolve(__dirname, '../messages');

for (const lang of ['fr', 'en', 'es', 'zh']) {
  const filePath = path.join(messagesDir, `${lang}.json`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Gemini occurrences with generic AI terms
  content = content.replace(/Scanner IA Gemini/g, 'Scanner IA');
  content = content.replace(/Escáner IA Gemini/g, 'Escáner IA');
  content = content.replace(/Gemini AI Scanner/g, 'AI Scanner');
  content = content.replace(/Gemini AI 智能扫描/g, '智能AI扫描');
  content = content.replace(/Gemini 2\.5 Flash/g, 'Intelligence Artificielle');
  content = content.replace(/Gemini AI Narration/g, 'Voice Narration');
  content = content.replace(/Gemini IA Narration/g, 'Narration Vocale IA');
  content = content.replace(/Narración IA Gemini/g, 'Narración por IA');
  content = content.replace(/Gemini AI 智能语音/g, '智能AI语音');
  content = content.replace(/grâce à Gemini IA/g, 'grâce à notre IA');
  content = content.replace(/IA Gemini/g, 'Scanner IA');
  content = content.replace(/Gemini AI/g, 'AI');
  content = content.replace(/Gemini IA/g, 'IA');
  content = content.replace(/Gemini/g, 'IA');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[OK] Cleaned Gemini from ${lang}.json`);
}
