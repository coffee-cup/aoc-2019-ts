import { execute, parseProgram } from "../intcode";

export const solve = async (input: string, v: number) => {
  const program = parseProgram(input);

  const result = await execute(program, { input: [v] });
  return result.output[0];
};
