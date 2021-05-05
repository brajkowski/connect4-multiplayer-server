import { generateSessionName } from '../src/util';

describe('util', () => {
  it('should return a session name that is 5 characters long', () => {
    expect(generateSessionName().length).toBe(5);
  });
});
