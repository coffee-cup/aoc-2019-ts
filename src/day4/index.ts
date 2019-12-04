import _ from "lodash";

const parseInput = (input: string): [number, number] =>
  input.split("-").map(n => parseInt(n, 10)) as [number, number];

const splitIntoDigits = (n: number): number[] => {
  let value = n;
  const digits: number[] = [];

  while (value > 0) {
    digits.push(Math.floor(value % 10));
    value = Math.floor(value / 10);
  }

  return digits.reverse();
};

const containsAdjDigits = (digits: number[]): boolean => {
  for (let i = 0; i < digits.length - 1; i += 1) {
    if (digits[i] === digits[i + 1]) {
      return true;
    }
  }

  return false;
};

const containsDoubleDigits = (digits: number[]): boolean => {
  const use = (index: number) =>
    index < 0 ? -1 : index >= digits.length ? -1 : digits[index];

  for (let i = 0; i < digits.length - 1; i += 1) {
    if (
      use(i - 1) !== use(i) &&
      use(i) === use(i + 1) &&
      use(i + 1) !== use(i + 2)
    ) {
      return true;
    }
  }

  return false;
};

const onlyIncreasing = (digits: number[]): boolean => {
  for (let i = 1; i < digits.length; i += 1) {
    if (digits[i] < digits[i - 1]) {
      return false;
    }
  }

  return true;
};

export const meetsCriteriaP1 = (n: number) => {
  const digits = splitIntoDigits(n);
  return containsAdjDigits(digits) && onlyIncreasing(digits);
};

export const meetsCriteriaP2 = (n: number) => {
  const digits = splitIntoDigits(n);
  return containsDoubleDigits(digits) && onlyIncreasing(digits);
};

export const solveP1 = (input: string) => {
  const [min, max] = parseInput(input);

  let count = 0;
  for (let n = min; n < max; n += 1) {
    const meets = meetsCriteriaP1(n);

    if (meets) {
      count += 1;
    }
  }

  return count;
};

export const solveP2 = (input: string) => {
  const [min, max] = parseInput(input);

  let count = 0;
  for (let n = min; n < max; n += 1) {
    const meets = meetsCriteriaP2(n);

    if (meets) {
      count += 1;
    }
  }

  return count;
};
