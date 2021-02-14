import { Action } from './action';

export interface Packet {
  session: string;
  action: Action;
  user: string;
  column?: number;
}
