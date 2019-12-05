import { execute } from "../intcode";

const parseInput = (input: string): number[] =>
  input
    .trim()
    .split(",")
    .map(n => parseInt(n, 10));

export const solve = (input: string, inputVal: number) => {
  const memory = parseInput(input);

  const result = execute(memory, inputVal);

  result.output.forEach(({ value }, i) => {
    if (i !== result.output.length - 1 && value !== 0) {
      throw new Error(`Output is not 0. It is ${value}`);
    }
  });

  return result.output[result.output.length - 1].value;
};
