import WebSocket = require('ws');
import { Data } from 'ws';

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
    this.ws.send('hello from client');
  }

  private onMessage(data: Data) {
    console.log(data);
  }
}
