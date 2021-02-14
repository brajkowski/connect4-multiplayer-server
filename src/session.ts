import { BitboardLogic, Player } from '@brajkowski/connect4-web-logic';
import { ClientAction } from './model/client-action';
import { ClientPacket } from './model/client-packet';
import { ServerAction } from './model/server-action';
import { ServerPacket } from './model/server-packet';
import WebSocket = require('ws');

export class Session {
  private logic = new BitboardLogic();
  private userMap = new Map<string, Player>();

  constructor(private owner: WebSocket) {
    const packet: ServerPacket = {
      action: ServerAction.OK,
    };
    this.owner.send(JSON.stringify(packet));
  }

  handlePacket(packet: ClientPacket) {
    switch (packet.action) {
      case ClientAction.JOIN_SESSION:
        this.mapUser(packet.user);
      case ClientAction.MOVE:
        this.move(packet.user, packet.column);
    }
  }

  private move(user: string, column: number) {
    if (this.logic.canPlaceChip(column)) {
      this.logic.placeChip(this.userMap.get(user), column);
    }
  }

  private mapUser(user: string) {
    if (this.userMap.size === 0) {
      this.userMap.set(user, Player.One);
    } else if (this.userMap.size === 1) {
      this.userMap.set(user, Player.Two);
    } else {
      throw new Error('Too many players joined session');
    }
  }
}
