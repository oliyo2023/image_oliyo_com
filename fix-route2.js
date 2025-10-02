// Script to fix remaining getArticleById calls in the route.ts file
const fs = require('fs');

// Read the file
const filePath = 'E:/project/oliyo.com/src/app/api/admin/articles/[id]/route.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Split content into lines
const lines = content.split('\n');

// Fix line 437
if (lines[436] && lines[436].includes('const currentArticle = await getArticleById(articleId);')) {
  lines[436] = '      const currentArticleResult = await getArticleById(articleId);';
  lines.splice(437, 0, '      const currentArticle = currentArticleResult?.article || null;');
}

// Fix line 637 (now 638 because we inserted a line)
if (lines[637] && lines[637].includes('const currentArticle = await getArticleById(articleId);')) {
  lines[637] = '        const currentArticleResult = await getArticleById(articleId);';
  lines.splice(638, 0, '        const currentArticle = currentArticleResult?.article || null;');
}

// Join lines back together
content = lines.join('\n');

fs.writeFileSync(filePath, content);
console.log('Fixed remaining getArticleById calls in the route.ts file');