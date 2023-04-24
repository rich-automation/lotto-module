import { seconds } from '../../utils/seconds';

describe('seconds', () => {
  it('should return 0 when 0 is passed', () => {
    expect(seconds(0)).toBe(0);
  });

  it('should return 1000 when 1 is passed', () => {
    expect(seconds(1)).toBe(1000);
  });

  it('should return 2000 when 2 is passed', () => {
    expect(seconds(2)).toBe(2000);
  });

  it('should return 5000 when 5 is passed', () => {
    expect(seconds(5)).toBe(5000);
  });
});
