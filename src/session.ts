import { BitboardLogic, Player } from '@brajkowski/connect4-logic';
import {
  ClientAction,
  ClientPacket,
  ServerAction,
  ServerPacket,
} from '@brajkowski/connect4-multiplayer-common';
import { generateSessionName } from './util';
import WebSocket = require('ws');

export class Session {
  private logic = new BitboardLogic();
  private playerMap = new Map<string, Player>();
  private webSocketMap = new Map<WebSocket, Player>();
  private reverseWebSocketMap = new Map<Player, WebSocket>();
  private opponent: WebSocket;
  private opponentName: string;
  private activePlayer = Player.One;
  private sessionNm: string;

  public get sessionName(): string {
    return this.sessionNm;
  }

  constructor(private owner: WebSocket, private ownerName: string) {
    this.playerMap.set(this.ownerName, Player.One);
    this.webSocketMap.set(this.owner, Player.One);
    this.reverseWebSocketMap.set(Player.One, this.owner);
    this.sessionNm = generateSessionName();
  }

  handlePacket(ws: WebSocket, packet: ClientPacket) {
    switch (packet.action) {
      case ClientAction.MOVE:
        this.move(ws, packet.column);
    }
  }

  opponentJoin(opponent: WebSocket, opponentName: string) {
    this.opponent = opponent;
    this.opponentName = opponentName;
    this.playerMap.set(this.opponentName, Player.Two);
    this.webSocketMap.set(this.opponent, Player.Two);
    this.reverseWebSocketMap.set(Player.Two, this.opponent);
    const confirmPacket: ServerPacket = {
      action: ServerAction.JOINED_SESSION,
      user: this.ownerName,
    };
    this.opponent.send(JSON.stringify(confirmPacket));
    const opponentJoinedPacket: ServerPacket = {
      action: ServerAction.OPPONENT_JOIN,
      user: this.opponentName,
    };
    this.owner.send(JSON.stringify(opponentJoinedPacket));
  }

  opponentQuit(quittingWebsocket: WebSocket) {
    const quittingPlayer = this.webSocketMap.get(quittingWebsocket);
    const alertPlayer = quittingPlayer === Player.One ? Player.Two : Player.One;
    const alertPlayerWebsocket = this.reverseWebSocketMap.get(alertPlayer);
    const quitAlertPacket: ServerPacket = {
      action: ServerAction.OPPONENT_QUIT,
    };
    alertPlayerWebsocket.send(JSON.stringify(quitAlertPacket));
  }

  private move(ws: WebSocket, column: number) {
    const requestingPlayer: Player = this.webSocketMap.get(ws);
    try {
      if (
        requestingPlayer === this.activePlayer &&
        this.logic.canPlaceChip(column)
      ) {
        this.logic.placeChip(requestingPlayer, column);
        const opponentMovePacket: ServerPacket = {
          action: ServerAction.OPPONENT_MOVE,
          column,
        };
        this.getOppositeWebSocket().send(JSON.stringify(opponentMovePacket));
        this.activePlayer = this.getOppositePlayer();
      } else {
        const notAllowedPacket: ServerPacket = {
          action: ServerAction.NOT_ALLOWED,
        };
        ws.send(JSON.stringify(notAllowedPacket));
      }
    } catch (err) {
      const notAllowedPacket: ServerPacket = {
        action: ServerAction.NOT_ALLOWED,
      };
      ws.send(JSON.stringify(notAllowedPacket));
    }
  }

  private getOppositePlayer(): Player {
    if (this.activePlayer === Player.One) {
      return Player.Two;
    }
    return Player.One;
  }

  private getOppositeWebSocket(): WebSocket {
    return this.reverseWebSocketMap.get(this.getOppositePlayer());
  }
}
