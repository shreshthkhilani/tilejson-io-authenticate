// server.js

const axios = require('axios');
const express = require('express');
const app = express();

const githubUrl = 'https://github.com/login/oauth/access_token';
const githubHeaders = {
  Accept: 'application/json'
};
const githubAxios = axios.create({
  baseURL: githubUrl,
  headers: githubHeaders
});

app.get('/authenticate/:code', (request, response) => {
  const code = request.params.code;
  const state = request.query.state;
  // POST to GitHub
  const githubPayload = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
    state
  };
  console.log(githubPayload);
  githubAxios.post('/', githubPayload)
    .then((githubResponse) => {
      if (githubResponse.data.access_token) {
        response.send({ token: githubResponse.data.access_token });
      } else {
        response.status(githubResponse.status).send(githubResponse.data);
      }
  })
    .catch((githubError) => {
      response.status(githubError.response.status).send(githubError.response.data);
  });
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
