const fuelRequired = (mass: number, recursive: boolean) => {
  const f = Math.max(Math.floor(mass / 3) - 2, 0);

  if (f === 0 || !recursive) {
    return f;
  } else {
    const additional = fuelRequired(f, recursive);
    return f + additional;
  }
};

const parseInput = (input: string): number[] =>
  input
    .trim()
    .split("\n")
    .map(n => parseInt(n, 10));

export const solveP1 = (input: string): number => {
  const modules = parseInput(input);

  const fuels = modules.map(m => fuelRequired(m, false));
  return fuels.reduce((acc, n) => acc + n, 0);
};

export const solveP2 = (input: string): number => {
  const modules = parseInput(input);

  const fuels = modules.map(m => fuelRequired(m, true));
  return fuels.reduce((acc, n) => acc + n, 0);
};
