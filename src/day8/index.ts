import _ from "lodash";

const width = 25;
const height = 6;

enum PixelValues {
  Black = 0,
  White = 1,
  Transparent = 2
}

const parseInput = (input: string): number[][] => {
  const arr = input
    .trim()
    .split("")
    .map(n => parseInt(n, 10));
  return _.chunk(arr, width * height);
};

export const solveP1 = (input: string): number => {
  const layers = parseInput(input);

  let fewestDigits = Infinity;
  let fewestLayer = -1;

  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];
    const numZeros = layer.filter(n => n === 0).length;
    if (numZeros < fewestDigits) {
      fewestDigits = numZeros;
      fewestLayer = i;
    }
  }

  const numOnes = layers[fewestLayer].filter(n => n === 1).length;
  const numTwos = layers[fewestLayer].filter(n => n === 2).length;

  return numOnes * numTwos;
};

export const solveP2 = (input: string) => {
  const layers = parseInput(input);

  const image = new Array(width * height).fill(PixelValues.Transparent);

  for (let i = layers.length - 1; i >= 0; i -= 1) {
    const layer = layers[i];

    for (let p = 0; p < layer.length; p += 1) {
      const pixel = layer[p];

      if (pixel !== PixelValues.Transparent) {
        image[p] = pixel;
      }
    }
  }

  return render(image);
};

export const render = (image: number[]): string => {
  const filled = "█";
  let s = "";
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const pixel = image[row * width + col];

      const val = pixel === PixelValues.Black ? " " : filled;
      s += val;
    }

    s += "\n";
  }

  return s;
};
