import WebSocket = require('ws');
import { Data } from 'ws';
import { Action } from './model/action';
import { ClientPacket } from './model/client-packet';

export class Connect4Client {
  private ws: WebSocket;

  constructor() {}

  open(address: string) {
    this.ws = new WebSocket(address);
    this.ws.on('message', this.onMessage.bind(this));
    this.ws.on('open', this.onOpen.bind(this));
  }

  close() {
    this.ws.close();
  }

  private onOpen() {
    const packet: ClientPacket = {
      session: null,
      action: Action.CREATE_SESSION,
      user: 'brandon',
    };
    this.ws.send(JSON.stringify(packet));
  }

  private onMessage(data: Data) {
    const packet: ClientPacket = JSON.parse(data.toString());
    console.log(packet);
  }
}
