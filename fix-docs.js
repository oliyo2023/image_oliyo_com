// Fix both the curl command and JSON response examples in docs file
const fs = require('fs');

// Read the file
const filePath = 'E:/project/oliyo.com/src/app/docs/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the curl command example first (we know this worked before)
content = content.replace(
    `{'  '}-d '{'{'}\\n`,
    `{'  '}-d '{"{"}\\n`
);

// Also fix the following lines in the curl command
// The structure should be: -d '{'  (opening), then content, then closing '
content = content.replace(
    `{'    '}"key": "value"\\n
                              {'  '}'}'`,
    `{'    '}"key": "value"\\n
                              {'  '}""}"`
);

// Now fix the JSON response example
// The complete problematic block should output:
// {
//   "success": true,
//   "message": "Operation completed successfully", 
//   "data": '{ /* Response data */ }'
// }

content = content.replace(
    `{'  '}"data\": '{\"{\"} /* Response data */ \"}\"\\n
                              '}'`,
    `{'  '}"data\": '{' /* Response data */ '}'\\n
                              '}'`
);

fs.writeFileSync(filePath, content);
console.log('Fixed both the curl command and JSON response examples');