import { Connect4Client } from './client';
import { Connect4Server } from './server';

const address = 'ws://localhost:8080';
const session = 'test-session';

const server = new Connect4Server();
const owner = new Connect4Client();
const opponent = new Connect4Client();
server.start(8080);

owner.open(address);
opponent.open(address);

setTimeout(() => {
  owner.createSession(session, 'owner');
  opponent.joinSession(session, 'opponent');
}, 1000);

setTimeout(() => {
  owner.makeMove(0);
}, 2000);

setTimeout(() => {
  opponent.makeMove(1);
}, 3000);
