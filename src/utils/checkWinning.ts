export const checkWinning = (myNumber: number[], winningNumbers: number[]) => {
  const mainWinningNumbers = winningNumbers.slice(0, 6);
  const bonusNumber = winningNumbers.at(-1) as number;

  const matchedNumbers = myNumber.filter(n => mainWinningNumbers.includes(n));
  const matchingNumbersCount = matchedNumbers.length;

  let rank = 0;
  if (matchingNumbersCount === 6) {
    rank = 1;
  } else if (matchingNumbersCount === 5 && myNumber.includes(bonusNumber)) {
    matchedNumbers.push(bonusNumber);
    rank = 2;
  } else if (matchingNumbersCount === 5) {
    rank = 3;
  } else if (matchingNumbersCount === 4) {
    rank = 4;
  } else if (matchingNumbersCount === 3) {
    rank = 5;
  }
  return { rank, matchedNumbers };
};
