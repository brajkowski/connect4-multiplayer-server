import WebSocket = require('ws');
import {
  ClientAction,
  ClientPacket,
  ServerAction,
  ServerPacket,
} from '@brajkowski/connect4-multiplayer-common';
import { Data, Server } from 'ws';
import { Session } from './session';

export class Connect4Server {
  private wss: Server;
  private sessions: Map<string, Session> = new Map();

  start(port: number) {
    this.wss = new Server({ port });
    this.wss.on('connection', this.onConnection.bind(this));
    console.log(`Server started listening on port ${port}`);
  }

  stop() {
    this.wss.close();
  }

  private onConnection(ws: WebSocket) {
    ws.on('message', (data) => this.onMessage(ws, data));
  }

  private onMessage(ws: WebSocket, data: Data) {
    let incomingPacket: ClientPacket;
    try {
      incomingPacket = JSON.parse(data.toString());
    } catch (err) {
      return;
    }
    console.log(incomingPacket);
    if (incomingPacket.action === ClientAction.CREATE_SESSION) {
      this.createSession(ws, incomingPacket);
      return;
    }
    if (
      incomingPacket.session === undefined ||
      !this.sessions.has(incomingPacket.session)
    ) {
      const packet: ServerPacket = {
        action: ServerAction.SESSION_NOT_FOUND,
      };
      ws.send(JSON.stringify(packet));
      return;
    }
    switch (incomingPacket.action) {
      case ClientAction.JOIN_SESSION:
        this.opponentJoinSession(ws, incomingPacket);
        break;
      case ClientAction.QUIT:
        this.opponentQuit(ws, incomingPacket);
        break;
      default:
        this.sessions
          .get(incomingPacket.session)
          .handlePacket(ws, incomingPacket);
    }
  }

  private createSession(ws: WebSocket, packet: ClientPacket) {
    let session: Session;
    do {
      session = new Session(ws, packet.user);
    } while (this.sessions.has(session.sessionName)); // Incase of UUID collision.
    const sessionName = session.sessionName;
    this.sessions.set(sessionName, session);
    this.sendSessionCreated(ws, sessionName);
  }

  private sendSessionCreated(ws: WebSocket, sessionName: string) {
    const packet: ServerPacket = {
      action: ServerAction.SESSION_CREATED,
      newSession: sessionName,
    };
    ws.send(JSON.stringify(packet));
  }

  private opponentJoinSession(ws: WebSocket, packet: ClientPacket) {
    const session = this.sessions.get(packet.session);
    if (session.isSessionFull()) {
      const packet: ServerPacket = {
        action: ServerAction.SESSION_NOT_FOUND,
      };
      ws.send(JSON.stringify(packet));
      return;
    }
    session.opponentJoin(ws, packet.user);
  }

  private opponentQuit(ws: WebSocket, packet: ClientPacket) {
    this.sessions.get(packet.session).opponentQuit(ws);
    this.sessions.delete(packet.session);
  }
}
