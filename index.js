/* eslint-disable linebreak-style */
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');

const covid19ImpactEstimator = require('./src/estimator');

const app = express();

const t = (tokens, req, res) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  [
    tokens.method(req, res),
    '\t\t',
    tokens.url(req, res),
    '\t\t',
    tokens.status(req, res),
    '\t\t',
    tokens['response-time'](req, res),
    'ms'
  ].join(' ');
// app.use(morgon('tiny'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  logger(t, {
    stream: fs.createWriteStream('./logs.txt', { flags: 'a' })
  })
);
app.use(logger('dev'));
app.use(
  require('xml-express-middleware').xml({
    transformXmlKeys: 'decamelize',
    rootXmlKey: 'someElement'
  })
);

app.post('/api/v1/on-covid-19/', (req, res) => {
  const result = covid19ImpactEstimator(req.body);
  res.send(result);
});
app.post('/api/v1/on-covid-19/:format', (req, res) => {
  const result = covid19ImpactEstimator(req.body);
  const { format } = req.params;
  if (format === 'json') {
    res.header('Content-Type', 'application/json');
    res.json(result);
  } else if (format === 'xml') {
    res.header('Content-Type', 'text/xml');
    res.xml(result);
  } else {
    res.status(404).send('Route not found \n please try json or xml format ');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger('server is on'));
