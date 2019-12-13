import { parseProgram, execute } from "../intcode";
import * as fs from "fs";
import * as path from "path";

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

enum Tile {
  Empty = 0,
  Wall,
  Block,
  Paddle,
  Ball
}

enum State {
  X = 0,
  Y,
  TileId
}

enum Joystick {
  Neutral = 0,
  Left = -1,
  Right = 1
}

const key = (x: number, y: number): string => `${x},${y}`;

export const solveP1 = async (input: string) => {
  const program = parseProgram(input);

  const grid: { [key: string]: Tile } = {};

  let state = State.X;
  let x = 0;
  let y = 0;

  const receiveOutput = (value: number) => {
    if (state === State.X) {
      x = value;
      state = State.Y;
    } else if (state === State.Y) {
      y = value;
      state = State.TileId;
    } else if (state === State.TileId) {
      grid[key(x, y)] = value as Tile;

      state = State.X;
    }
  };

  await execute(program, {
    receiveOutput
  });

  const numBlocks = Object.values(grid).filter(t => t === Tile.Block).length;
  return numBlocks;
};

export const solveP2 = async (input: string) => {
  const program = parseProgram(input);
  program[0] = 2;

  const grid: { [key: string]: Tile } = {};

  let state = State.X;
  let x = 0;
  let y = 0;

  let ballLoc = [0, 0];
  let paddleLoc = [0, 0];
  let score = 0;
  let winningScore = 0;
  let started = false;

  const checkIfWon = () =>
    Object.values(grid).filter(t => t === Tile.Block).length === 0;

  const receiveOutput = (value: number) => {
    if (state === State.X) {
      x = value;
      state = State.Y;
    } else if (state === State.Y) {
      y = value;
      state = State.TileId;
    } else if (state === State.TileId) {
      if (x === -1 && y === 0) {
        score = value;

        if (started && checkIfWon()) {
          winningScore = value;
        }
      } else {
        const tile = value as Tile;
        grid[key(x, y)] = tile;

        if (tile === Tile.Ball) {
          ballLoc = [x, y];
        } else if (tile === Tile.Paddle) {
          paddleLoc = [x, y];
        }
      }

      state = State.X;
    }
  };

  const requestInput = (): Promise<number> => {
    started = true;
    if (ballLoc[0] < paddleLoc[0]) {
      return Promise.resolve(Joystick.Left);
    } else if (ballLoc[0] > paddleLoc[0]) {
      return Promise.resolve(Joystick.Right);
    }

    return Promise.resolve(Joystick.Neutral);
  };

  await execute(program, {
    receiveOutput,
    requestInput
  });

  return winningScore;
};
