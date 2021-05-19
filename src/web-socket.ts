import WebSocket = require('ws');

export class WebSocketWithStatus extends WebSocket {
  public isAlive: boolean;
}
