import { BitboardLogic, Player } from '@brajkowski/connect4-logic';
import {
  ClientAction,
  ClientPacket,
  ServerAction,
  ServerPacket,
} from '@brajkowski/connect4-multiplayer-common';
import { generateSessionName } from './util';
import { WebSocketWithStatus } from './web-socket';

export class Session {
  private readonly restartDelay: number = 5000;
  private logic = new BitboardLogic();
  private playerMap = new Map<string, Player>();
  private webSocketMap = new Map<WebSocketWithStatus, Player>();
  private reverseWebSocketMap = new Map<Player, WebSocketWithStatus>();
  private opponent: WebSocketWithStatus;
  private opponentName: string;
  private activePlayer = Player.One;
  private sessionNm: string;

  public get sessionName(): string {
    return this.sessionNm;
  }

  constructor(private owner: WebSocketWithStatus, private ownerName: string) {
    this.playerMap.set(this.ownerName, Player.One);
    this.webSocketMap.set(this.owner, Player.One);
    this.reverseWebSocketMap.set(Player.One, this.owner);
    this.sessionNm = generateSessionName();
  }

  handlePacket(ws: WebSocketWithStatus, packet: ClientPacket) {
    switch (packet.action) {
      case ClientAction.MOVE:
        this.move(ws, packet.column);
    }
  }

  isSessionFull(): boolean {
    return this.playerMap.size >= 2;
  }

  opponentJoin(opponent: WebSocketWithStatus, opponentName: string) {
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

  opponentQuit(quittingWebsocket: WebSocketWithStatus) {
    const quittingPlayer = this.webSocketMap.get(quittingWebsocket);
    const alertPlayer = quittingPlayer === Player.One ? Player.Two : Player.One;
    const alertPlayerWebsocket = this.reverseWebSocketMap.get(alertPlayer);
    const quitAlertPacket: ServerPacket = {
      action: ServerAction.OPPONENT_QUIT,
    };
    alertPlayerWebsocket?.send(JSON.stringify(quitAlertPacket));
  }

  private move(ws: WebSocketWithStatus, column: number) {
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
    if (this.isGameFinished()) {
      this.restartWithDelay();
    }
  }

  private getOppositePlayer(): Player {
    if (this.activePlayer === Player.One) {
      return Player.Two;
    }
    return Player.One;
  }

  private getOppositeWebSocket(): WebSocketWithStatus {
    return this.reverseWebSocketMap.get(this.getOppositePlayer());
  }

  private isGameFinished(): boolean {
    return (
      this.logic.boardIsFull() ||
      this.logic.didWin(Player.One) ||
      this.logic.didWin(Player.Two)
    );
  }

  private restartWithDelay() {
    setTimeout(() => {
      console.log(`Restarting game for session: ${this.sessionName}`);
      this.logic.clear();
      this.activePlayer = Math.round(Math.random());
      this.webSocketMap.forEach((player, ws) => {
        const restartPacket: ServerPacket = {
          action: ServerAction.GAME_RESTART,
          thisClientStartsFirst: player == this.activePlayer,
        };
        ws.send(JSON.stringify(restartPacket));
      });
    }, this.restartDelay);
  }
}
