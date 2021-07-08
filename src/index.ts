import winston = require('winston');
import express from 'express';
import http from 'http';
import { Connect4Server } from './server';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: new winston.transports.Console(),
});

const app = express();
const httpServer = http.createServer(app);
const connect4Server = new Connect4Server();
const port = +(process.env.PORT || '8080');

app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
  if (req.path !== '/') {
    return res.redirect('/');
  }
  next();
});

httpServer.listen(port, () => {
  connect4Server.start(httpServer);
  logger.info(`Server started listening on port: ${port}`);
});
