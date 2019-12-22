import * as fs from "fs";
import * as path from "path";
import _ from "lodash";
import { parseProgram, execute, Memory } from "../intcode";
import clear from "clear";

enum Tile {
  Open = ".",
  Scaffold = "#"
}

interface Robot {
  pos: Pos;
  dir: string;
}

type Pos = [number, number];
type Map = Tile[][];

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

const findIntersections = (map: Map) => {
  const getTile = (r: number, c: number): Tile => {
    if (r < 0 || r >= map.length || c < 0 || c >= map[0].length) {
      return Tile.Open;
    }

    return map[r][c];
  };

  let intersectionSum = 0;

  for (let row = 0; row < map.length; row += 1) {
    for (let col = 0; col < map[row].length; col += 1) {
      const neighbours = [
        getTile(row, col),
        getTile(row - 1, col),
        getTile(row + 1, col),
        getTile(row, col - 1),
        getTile(row, col + 1)
      ];

      // console.log({ row, col, neighbours });
      const isInter = _.every(neighbours, n => n !== Tile.Open);

      if (isInter) {
        const top = row;
        const left = col;

        const topLeft = top * left;
        intersectionSum += topLeft;
      }
    }
  }

  return intersectionSum;
};

export const solveP1 = async (input: string) => {
  const program = parseProgram(input);

  let s = "";

  const receiveOutput = (value: number) => {
    if (value < 300) {
      const c = String.fromCharCode(value);
      s += c;
      // process.stdout.write(c);
    }
  };

  await execute(program, {
    receiveOutput
  });

  const map: Map = s
    .trim()
    .split("\n")
    .map(line => line.split("")) as Map;

  const result = findIntersections(map);
  return result;
};

const orientations = ["^", ">", "v", "<"];

const getMap = async (program: Memory): Promise<{ map: Map; robot: Robot }> => {
  let s = "";
  const robot: Robot = {
    dir: "^",
    pos: [0, 0]
  };

  let pos: Pos = [0, 0];

  const receiveOutput = (value: number) => {
    if (value < 300) {
      let c = String.fromCharCode(value);

      if (orientations.includes(c)) {
        robot.dir = c;
        robot.pos = pos;
        c = "#";
      }

      if (c === "\n") {
        pos = [0, pos[1] + 1];
      } else {
        pos = [pos[0] + 1, pos[1]];
      }

      s += c;
    }
  };

  await execute(program, {
    receiveOutput
  });

  const map: Map = s
    .trim()
    .split("\n")
    .map(line => line.split("")) as Map;

  return { map, robot };
};

const renderMap = (map: Map, robot: Robot) => {
  clear();

  console.log({ robot });
  map.forEach((row, r) => {
    row.forEach((s, c) => {
      if (r === robot.pos[1] && c === robot.pos[0]) {
        process.stdout.write(robot.dir);
      } else {
        process.stdout.write(s);
      }
    });
    process.stdout.write("\n");
  });
};

const findStart = (map: Map): Pos => {
  for (let row = 0; row < map.length; row += 1) {
    for (let col = 0; col < map[row].length; col += 1) {
      if (orientations.includes(map[row][col])) {
        return [col, row];
      }
    }
  }
};

const moveForward = (buddy: string, [x, y]: Pos) =>
  ({
    "^": [x, y - 1],
    ">": [x + 1, y],
    "<": [x - 1, y],
    v: [x, y + 1]
  }[buddy]);

const isSafe = (map: Map, x: number, y: number): boolean =>
  y >= 0 &&
  y < map.length &&
  x >= 0 &&
  x < map[0].length &&
  map[y][x] === Tile.Scaffold;

const getNewDirection = (map: Map, robot: Robot): string => {
  const [x, y] = robot.pos;
  const dir = robot.dir;
  if (dir === "^" || dir === "v") {
    if (isSafe(map, x - 1, y)) {
      robot.dir = "<";
      return dir === "^" ? "L" : "R";
    } else {
      robot.dir = ">";
      return dir === "^" ? "R" : "L";
    }
  } else {
    if (isSafe(map, x, y - 1)) {
      robot.dir = "^";
      return dir === ">" ? "L" : "R";
    } else {
      robot.dir = "v";
      return dir === ">" ? "R" : "L";
    }
  }
};

const getPath = async (map: Map, robot: Robot): Promise<string[]> => {
  let directions = [];

  let nextPos = moveForward(robot.dir, robot.pos);
  while (true) {
    let count = 0;
    while (isSafe(map, nextPos[0], nextPos[1])) {
      robot.pos = nextPos;

      nextPos = moveForward(robot.dir, robot.pos);
      count += 1;

      // renderMap(map, robot);
      // await new Promise(r => setTimeout(r, 100));
    }

    if (count > 0) {
      directions.push(count.toString());
    }

    const turn = getNewDirection(map, robot);

    if (directions[directions.length - 1] === turn) {
      directions = directions.slice(0, directions.length - 1);
      break;
    }

    directions.push(turn);

    nextPos = moveForward(robot.dir, robot.pos);
  }

  return directions;
};

const checkRoutines = async (
  program: Memory,
  main: string,
  a: string,
  b: string,
  c: string
) => {
  program[0] = 2;

  const routines = [a, b, c].join("\n");
  const feed = "n";

  let inputCode = `
${main}
${routines}
${feed}
`.trimLeft();

  let out = 0;

  const receiveOutput = (value: number) => {
    out = value;
  };

  const requestInput = async (): Promise<number> => {
    const c = inputCode[0];
    inputCode = inputCode.slice(1);

    return c.charCodeAt(0);
  };

  await execute(program, {
    requestInput,
    receiveOutput
  });

  return out;
};

const tryCompressions = (str: string) => {
  for (let a = 1; a <= 30; a++) {
    for (let b = 1; b <= 30; b++) {
      for (let c = 1; c <= 30; c++) {
        let remaining = str;

        const routineA = remaining.slice(0, a);
        remaining = remaining.replace(new RegExp(routineA + ",?", "gu"), "");

        const routineB = remaining.slice(0, b);
        remaining = remaining.replace(new RegExp(routineB + ",?", "gu"), "");

        const routineC = remaining.slice(0, c);
        remaining = remaining.replace(new RegExp(routineC + ",?", "gu"), "");

        if (remaining.length === 0) {
          let compressed = str;
          Object.entries({
            A: routineA,
            B: routineB,
            C: routineC
          }).forEach(
            ([key, value]) =>
              (compressed = compressed.replace(new RegExp(value, "gu"), key))
          );

          return { compressed, routineA, routineB, routineC };
        }
      }
    }
  }

  throw new Error("no compression found");
};

export const solveP2 = async (input: string) => {
  const program = parseProgram(input);

  const { map, robot } = await getMap([...program]);
  const path = await getPath(map, robot);

  const { compressed, routineA, routineB, routineC } = tryCompressions(
    path.join(",")
  );

  const result = checkRoutines(
    [...program],
    compressed,
    routineA,
    routineB,
    routineC
  );

  return result;
};
