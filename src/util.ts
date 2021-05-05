import { v4 } from 'uuid';

export function generateSessionName(): string {
  return v4().substring(0, 5);
}
