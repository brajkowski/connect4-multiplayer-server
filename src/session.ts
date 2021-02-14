import { BitboardLogic, Player } from '@brajkowski/connect4-web-logic';
import { Action } from './model/action';
import { Packet } from './model/packet';

export class Session {
  private logic = new BitboardLogic();
  private userMap = new Map<string, Player>();
  private activePlayer = Player.One;

  handlePacket(packet: Packet): void {
    switch (packet.action) {
      case Action.JOIN:
        this.mapUser(packet.user);
      case Action.MOVE:
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
