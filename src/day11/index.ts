import { execute, parseProgram, Memory } from "../intcode";
import _ from "lodash";

enum State {
  Paint = 0,
  Turn
}

enum Paint {
  Black = 0,
  White = 1
}

enum Dir {
  Up = 0,
  Right,
  Down,
  Left
}

enum Turn {
  Left = 0,
  Right
}

type Loc = { x: number; y: number };

const move = (loc: Loc, facing: Dir): Loc => {
  if (facing === Dir.Up) {
    return { x: loc.x, y: loc.y - 1 };
  } else if (facing === Dir.Right) {
    return { x: loc.x + 1, y: loc.y };
  } else if (facing === Dir.Down) {
    return { x: loc.x, y: loc.y + 1 };
  } else if (facing === Dir.Left) {
    return { x: loc.x - 1, y: loc.y };
  }
};

const turn = (facing: Dir, t: Turn): Dir => {
  if (t === Turn.Left) {
    if (facing === Dir.Up) {
      return Dir.Left;
    } else if (facing === Dir.Right) {
      return Dir.Up;
    } else if (facing === Dir.Down) {
      return Dir.Right;
    } else if (facing === Dir.Left) {
      return Dir.Down;
    }
  } else if (t === Turn.Right) {
    if (facing === Dir.Up) {
      return Dir.Right;
    } else if (facing === Dir.Right) {
      return Dir.Down;
    } else if (facing === Dir.Down) {
      return Dir.Left;
    } else if (facing === Dir.Left) {
      return Dir.Up;
    }
  }
};

const key = (loc: Loc): string => `${loc.x},${loc.y}`;

const paint = async (
  program: Memory,
  starting: Paint
): Promise<{ [key: string]: Paint }> => {
  let state: State = State.Paint;

  let first = true;

  let loc: Loc = { x: 0, y: 0 };
  let facing: Dir = Dir.Up;

  const grid: { [key: string]: Paint } = {
    [key(loc)]: starting
  };

  const receiveOutput = (value: number) => {
    if (state === State.Paint) {
      grid[key(loc)] = value === 1 ? Paint.White : Paint.Black;

      state = State.Turn;
    } else if (state === State.Turn) {
      const t = value === 1 ? Turn.Right : Turn.Left;
      facing = turn(facing, t);
      loc = move(loc, facing);

      state = State.Paint;
    }
  };

  const requestInput = () => {
    if (first) {
      first = false;
      return Promise.resolve(starting);
    }

    let colour = grid[key(loc)];
    if (colour == null) {
      colour = Paint.Black;
    }

    return Promise.resolve(colour);
  };

  await execute(program, {
    requestInput,
    receiveOutput
  });

  return grid;
};

export const solveP1 = async (input: string) => {
  const program = parseProgram(input);
  const grid = await paint(program, Paint.Black);

  return Object.keys(grid).length;
};

export const solveP2 = async (input: string) => {
  const program = parseProgram(input);

  const grid = await paint(program, Paint.White);

  const locs: Loc[] = Object.keys(grid).map(s => {
    const [x, y] = s.split(",");
    return { x: parseInt(x, 10), y: parseInt(y, 10) };
  });

  const minX = _.minBy(locs, l => l.x).x;
  const maxX = _.maxBy(locs, l => l.x).x;

  const minY = _.minBy(locs, l => l.y).y;
  const maxY = _.maxBy(locs, l => l.y).y;

  const filled = "█";
  let s = "";
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const value = grid[key({ x, y })];
      s += value === Paint.Black || value == null ? " " : filled;
    }

    s += "\n";
  }

  return s;
};
