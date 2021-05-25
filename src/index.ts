import winston = require('winston');
import { Connect4Server } from './server';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: new winston.transports.Console(),
});

const server = new Connect4Server();
server.start(+process.env.PORT || 8081);
