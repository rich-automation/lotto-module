export const validateLottoNumber = (numbers: number[]) => {
  return (
    numbers
      .filter(number => {
        return typeof number === 'number' && Math.max(number, 45) === 45 && Math.min(number, 1) === 1;
      })
      .filter((number, index) => numbers.indexOf(number) === index).length === 6
  );
};
