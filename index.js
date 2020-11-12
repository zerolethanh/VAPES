const express = require('express');
const shelljs = require('shelljs');
const app = express();
const port = 3000;
const IncomingWebhook = require('@slack/webhook').IncomingWebhook;
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/xxx/yyy/zzz'; //TODO change this
const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL);
const log = console.log;
const service_dir = '/var/www/my-service'; // TODO change your service directory

app.post('/deploy', async (req, res) => {
  const shellJSResult = shelljs.exec(
      `cd ${service_dir} && git pull`, {silent: true});
  const text = genSlackText(shellJSResult);
  log(text);
  await webhook.send({text, username: `${service_dir.split('/').pop()}`});
  return res.send(text);
});

app.post('/self-restart', async (req, res) => {
  const shellJSResult = shelljs.exec('git pull', {silent: true});
  const text = genSlackText(shellJSResult);
  await webhook.send({text, username: 'self-restart'});
  res.send(text);
  shelljs.exec('pm2 restart all', {silent: true});
  return null;
});

const genSlackText = (shellJSResult) => {
  let result = shellJSResult.split(`\n`).join(` \n `);
  log(result);
  const now = new Date().toLocaleString();
  return `--- ${now} --- \n ${result}`;
};

app.listen(port, () => {
  log(`App running at port ${port}`);
});
