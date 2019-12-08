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

export const permute = <T>(permutation: T[]): T[][] => {
  let length = permutation.length,
    result = [permutation.slice()],
    c = new Array(length).fill(0),
    i = 1,
    k,
    p;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      result.push(permutation.slice());
    } else {
      c[i] = 0;
      ++i;
    }
  }

  return result;
};
