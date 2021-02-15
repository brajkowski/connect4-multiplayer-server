import { BitboardLogic, Player } from '@brajkowski/connect4-web-logic';
import { ClientAction } from './model/client-action';
import { ClientPacket } from './model/client-packet';
import { ServerAction } from './model/server-action';
import { ServerPacket } from './model/server-packet';
import WebSocket = require('ws');

export class Session {
  private logic = new BitboardLogic();
  private playerMap = new Map<string, Player>();
  private webSocketMap = new Map<WebSocket, Player>();
  private opponent: WebSocket;
  private opponentName: string;

  constructor(private owner: WebSocket, private ownerName: string) {
    this.playerMap.set(this.ownerName, Player.One);
    this.webSocketMap.set(this.owner, Player.One);
    const packet: ServerPacket = {
      action: ServerAction.OK,
    };
    this.owner.send(JSON.stringify(packet));
  }

  handlePacket(ws: WebSocket, packet: ClientPacket) {
    switch (packet.action) {
      case ClientAction.MOVE:
        this.move(packet.user, packet.column);
    }
  }

  opponentJoin(opponent: WebSocket, opponentName: string) {
    this.opponent = opponent;
    this.opponentName = opponentName;
    this.playerMap.set(this.opponentName, Player.Two);
    this.webSocketMap.set(this.opponent, Player.Two);
    const confirmPacket: ServerPacket = {
      action: ServerAction.OK,
      user: this.ownerName,
    };
    this.opponent.send(JSON.stringify(confirmPacket));
    const opponentJoinedPacket: ServerPacket = {
      action: ServerAction.OPPONENT_JOIN,
      user: this.opponentName,
    };
    this.owner.send(JSON.stringify(opponentJoinedPacket));
  }

  private move(user: string, column: number) {
    if (this.logic.canPlaceChip(column)) {
      this.logic.placeChip(this.playerMap.get(user), column);
    }
  }
}
