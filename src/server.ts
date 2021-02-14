import WebSocket = require('ws');
import { Data, Server } from 'ws';
import { ClientAction } from './model/client-action';
import { ClientPacket } from './model/client-packet';
import { ServerAction } from './model/server-action';
import { ServerPacket } from './model/server-packet';
import { Session } from './session';

export class Connect4Server {
  private wss: Server;
  private sessions: Map<string, Session> = new Map();

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
  }

  private onMessage(ws: WebSocket, data: Data) {
    const incomingPacket: ClientPacket = JSON.parse(data.toString());
    console.log(incomingPacket);
    if (incomingPacket.action === ClientAction.CREATE_SESSION) {
      const responsePacket = this.createSession(incomingPacket);
      ws.send(JSON.stringify(responsePacket));
      return;
    }
    const responsePacket = this.sessions
      .get(incomingPacket.session)
      .handlePacket(incomingPacket);
    ws.send(JSON.stringify(responsePacket));
  }

  private createSession(packet: ClientPacket): ServerPacket {
    this.sessions.set(packet.session, new Session(packet.user));
    return {
      action: ServerAction.OK,
    };
  }
}
