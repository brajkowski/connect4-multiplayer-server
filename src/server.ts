import WebSocket = require('ws');
import { Data, Server } from 'ws';

export class Connect4Server {
  private wss: Server;

  constructor() {}

  start(port: number) {
    this.wss = new Server({ port });
    this.wss.on('connection', this.onConnection.bind(this));
  }

  stop() {
    this.wss.close();
  }

  private onConnection(ws: WebSocket) {
    ws.on('message', this.onMessage.bind(this));
    ws.send('hello from server');
  }

  private onMessage(data: Data) {
    console.log(data);
  }
}
