import { Action } from './action';

export interface ClientPacket {
  session: string;
  action: Action;
  user: string;
  column?: number;
}
