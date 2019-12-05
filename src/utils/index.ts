export const splitIntoDigits = (n: number) => {
  if (n === 0) {
    return [0];
  }

  let value = n;
  const digits = [];

  while (value > 0) {
    digits.push(Math.floor(value % 10));
    value = Math.floor(value / 10);
  }

  return digits.reverse();
};
