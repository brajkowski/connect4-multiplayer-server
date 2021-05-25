import {
  ClientAction,
  ClientPacket,
  ServerAction,
  ServerPacket,
} from '@brajkowski/connect4-multiplayer-common';
import { Data, Server } from 'ws';
import { logger } from '.';
import { Session } from './session';
import { WebSocketWithStatus } from './web-socket';

export class Connect4Server {
  private wss: Server;
  private sessions: Map<string, Session> = new Map();

  start(port: number) {
    this.wss = new Server({ port });
    this.wss.on('connection', this.onConnection.bind(this));
    logger.info(`Server started listening on port: ${port}`);
  }

  stop() {
    this.wss.close();
    logger.info('Server stopped');
  }

  private onConnection(ws: WebSocketWithStatus) {
    ws.on('pong', () => this.onPong(ws));
    ws.on('message', (data) => this.onMessage(ws, data));
  }

  private onPong(ws: WebSocketWithStatus) {
    ws.isAlive = true;
    logger.debug('Pong received');
  }

  private onMessage(ws: WebSocketWithStatus, data: Data) {
    let incomingPacket: ClientPacket;
    try {
      incomingPacket = JSON.parse(data.toString());
    } catch (err) {
      logger.warn('Invalid packet received');
      return;
    }
    logger.info('Valid packet received', [incomingPacket]);
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

  private createSession(ws: WebSocketWithStatus, packet: ClientPacket) {
    let session: Session;
    do {
      session = new Session(ws, packet.user, this.deleteSession.bind(this));
    } while (this.sessions.has(session.sessionName)); // Incase of UUID collision.
    const sessionName = session.sessionName;
    this.sessions.set(sessionName, session);
    this.sendSessionCreated(ws, sessionName);
    logger.info(`Created session: ${sessionName}`);
  }

  private sendSessionCreated(ws: WebSocketWithStatus, sessionName: string) {
    const packet: ServerPacket = {
      action: ServerAction.SESSION_CREATED,
      newSession: sessionName,
    };
    ws.send(JSON.stringify(packet));
  }

  private opponentJoinSession(ws: WebSocketWithStatus, packet: ClientPacket) {
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

  private opponentQuit(ws: WebSocketWithStatus, packet: ClientPacket) {
    this.sessions.get(packet.session).opponentQuit(ws);
  }

  private deleteSession(sessionName: string) {
    this.sessions.delete(sessionName);
    logger.info(`Deleted session: ${sessionName}`);
  }
}
