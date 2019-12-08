import { execute } from "../intcode";

const parseInput = (input: string): number[] =>
  input
    .trim()
    .split(",")
    .map(n => parseInt(n, 10));

export const solveP1 = async (input: string): Promise<number> => {
  const memory = parseInput(input);

  memory[1] = 12;
  memory[2] = 2;

  return (await execute(memory)).memory[0];
};

export const solveP2 = async (input: string): Promise<number> => {
  const goal = 19690720;

  let found: [number, number] | null = null;
  for (let noun = 0; noun < 100; noun += 1) {
    if (found != null) {
      break;
    }

    for (let verb = 0; verb < 100; verb += 1) {
      const opcodes = parseInput(input);

      opcodes[1] = noun;
      opcodes[2] = verb;

      const res = (await execute(opcodes)).memory;

      if (res[0] === goal) {
        found = [noun, verb];
        break;
      }
    }
  }

  if (found == null) {
    throw new Error("not found");
  }

  return 100 * found[0] + found[1];
};
