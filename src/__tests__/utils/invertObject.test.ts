import { invertObject } from '../../utils/invertObject';

describe('invertObject', () => {
  it('should invert object with string keys', () => {
    const obj = { a: 'x', b: 'y', c: 'z' };
    const inverted = invertObject(obj);
    expect(inverted).toEqual({ x: 'a', y: 'b', z: 'c' });
  });

  it('should invert object with number keys', () => {
    const obj = { 1: 'x', 2: 'y', 3: 'z' };
    const inverted = invertObject(obj);
    expect(inverted).toEqual({ x: '1', y: '2', z: '3' });
  });
});
