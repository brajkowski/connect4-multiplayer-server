import WebSocket = require('ws');
import { Data } from 'ws';
import { ClientAction } from './model/client-action';
import { ClientPacket } from './model/client-packet';

export class Connect4Client {
  private ws: WebSocket;
  private session: string;
  private user: string;

  open(address: string) {
    this.ws = new WebSocket(address);
    this.ws.on('message', this.onMessage.bind(this));
  }

  close() {
    this.ws.close();
  }

  createSession(session: string, user: string) {
    this.session = session;
    this.user = user;
    const packet: ClientPacket = {
      session: this.session,
      user: this.user,
      action: ClientAction.CREATE_SESSION,
    };
    this.ws.send(JSON.stringify(packet));
  }

  joinSession(session: string, user: string) {
    this.session = session;
    this.user = user;
    const packet: ClientPacket = {
      session: this.session,
      user: this.user,
      action: ClientAction.JOIN_SESSION,
    };
    this.ws.send(JSON.stringify(packet));
  }

  makeMove(column: number) {
    const packet: ClientPacket = {
      session: this.session,
      user: this.user,
      action: ClientAction.MOVE,
      column: column,
    };
    this.ws.send(JSON.stringify(packet));
  }

  private onMessage(data: Data) {
    const packet: ClientPacket = JSON.parse(data.toString());
    console.log(packet);
  }
}
