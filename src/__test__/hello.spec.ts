import { helloWorld } from '../hello';

describe('index.ts', () => {
  it('Should return hello world message', () => {
    expect(helloWorld()).toBe('Hello World!');
  });
});
