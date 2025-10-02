// Script to fix the getArticleById calls in the route.ts file
const fs = require('fs');

// Read the file
const filePath = 'E:/project/oliyo.com/src/app/api/admin/articles/[id]/route.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the specific patterns with corrected versions
// Fix the first occurrence in the PUT method
content = content.replace(
  '    // Get current article for audit log\n    const currentArticle = await getArticleById(articleId);\n\n    // Prepare update data',
  '    // Get current article for audit log\n    const currentArticleResult = await getArticleById(articleId);\n    const currentArticle = currentArticleResult?.article || null;\n\n    // Prepare update data'
);

// Fix the second occurrence in another method
content = content.replace(
  '    // Get current article for audit log\n      const currentArticle = await getArticleById(articleId);\n\n      // Log audit action',
  '    // Get current article for audit log\n      const currentArticleResult = await getArticleById(articleId);\n      const currentArticle = currentArticleResult?.article || null;\n\n      // Log audit action'
);

// Fix the third occurrence
content = content.replace(
  '    // Get current article for audit log\n        const currentArticle = await getArticleById(articleId);\n\n        // Log audit action',
  '    // Get current article for audit log\n        const currentArticleResult = await getArticleById(articleId);\n        const currentArticle = currentArticleResult?.article || null;\n\n        // Log audit action'
);

fs.writeFileSync(filePath, content);
console.log('Fixed all getArticleById calls in the route.ts file');