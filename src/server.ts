import WebSocket = require('ws');
import { BitboardLogic } from '@brajkowski/connect4-web-logic';
import { Data, Server } from 'ws';
import { Action } from './model/action';
import { Packet } from './model/packet';

export class Connect4Server {
  private wss: Server;
  private sessions: Map<string, BitboardLogic> = new Map();

  constructor() {}

  start(port: number) {
    this.wss = new Server({ port });
    this.wss.on('connection', this.onConnection.bind(this));
  }

  stop() {
    this.wss.close();
  }

  private onConnection(ws: WebSocket) {
    ws.on('message', (data) => this.onMessage(ws, data));
    const packet: Packet = {
      session: null,
      action: Action.OK,
      user: 'server',
    };
    ws.send(JSON.stringify(packet));
  }

  private onMessage(ws: WebSocket, data: Data) {
    const packet: Packet = JSON.parse(data.toString());
    console.log(packet);
  }
}
