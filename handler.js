const fs = require('fs');

const typeMap = {
  js: 'application/javascript',
  html: 'text/html',
};

module.exports.static = (event, context, callback) => {
  const fileName = event.pathParameters
    ? event.pathParameters.fileName
    : 'index.html';

  const content = fs.readFileSync(fileName, 'utf-8');
  const fileNameArr = fileName.split('.');
  const fileExtension = fileNameArr[fileNameArr.length - 1];

  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': typeMap[fileExtension],
    },
    body: content,
  };
  callback(null, response);
};
