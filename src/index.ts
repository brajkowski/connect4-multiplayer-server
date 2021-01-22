import { Connect4Client } from './client';
import { Connect4Server } from './server';

const server = new Connect4Server();
const client = new Connect4Client();
server.start(8080);
client.open('ws://localhost:8080');
