import { ClientAction } from './client-action';

export interface ClientPacket {
  session: string;
  action: ClientAction;
  user: string;
  column?: number;
}
