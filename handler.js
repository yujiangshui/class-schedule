const fs = require('fs');

module.exports.render = (event, context, callback) => {
  const html = fs.readFileSync('./index.html', 'utf-8');

  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: html,
  };
  callback(null, response);
};
