import { ServerAction } from './server-action';

export interface ServerPacket {
  action: ServerAction;
  user?: string;
  column?: number;
}
