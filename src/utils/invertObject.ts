type Obj = Record<string | number, string | number>;
type Inverted<T extends Obj> = {
  [P in keyof T as T[P]]: P;
};

export function invertObject<T extends Obj>(obj: T): Inverted<T> {
  const result = {} as Obj;
  for (const [key, value] of Object.entries(obj)) {
    result[value] = key;
  }
  return result as Inverted<T>;
}
