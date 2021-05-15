import { Connect4Server } from './server';

const server = new Connect4Server();
server.start(+process.env.PORT || 8081);
