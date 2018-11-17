const { execSync } = require('child_process')
const crypto = require('crypto');
const headerKey = 'x-hub-signature';

function verifyPostData(request, response, next) {
  const payload = JSON.stringify(request.body);
  if (!payload) {
    return next('Request body empty');
  }

  const hmac = crypto.createHmac('sha1', process.env.DEPLOY_SECRET);
  const digest = 'sha1=' + hmac.update(payload).digest('hex');
  const checksum = request.headers[headerKey];
  if (!checksum || !digest || checksum !== digest) {
    return next(`Request body digest (${digest}) did not match ${headerKey} (${checksum})`);
  }
  return next();
}

function refreshApp(request, response) {
  if (request.body.ref !== 'refs/heads/glitch') {
    response.status(200).send('Push was not to glitch branch, so did not deploy.');
    return;
  }
  
  const repoUrl = request.body.repository.git_url;

  console.log('Fetching latest changes.');
  response.status(200).send();
  const output = execSync(
    `git checkout -- ./ && git pull -X theirs ${repoUrl} glitch && refresh`
  ).toString();
  console.log(output);
}

module.exports = {
  verifyPostData,
  refreshApp
};