import * as fs from "fs";
import * as path from "path";
import _ from "lodash";
import { parseProgram, execute, Memory } from "../intcode";
import { findPath, getNeighbours } from "../pathfinding";
import clear from "clear";

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

type Pos = [number, number];

enum Tile {
  Wall = 0,
  Floor,
  Oxygen
}

enum Direction {
  North = 1,
  South = 2,
  West = 3,
  East = 4
}

enum Status {
  HitWall = 0,
  Moved = 1,
  MovedAndFound = 2
}

type Map = { [key: string]: Tile };

const key = ([x, y]: Pos): string => `${x},${y}`;

const parseKey = (key: string): Pos => {
  const [xs, ys] = key.split(",");
  return [parseInt(xs, 10), parseInt(ys, 10)];
};

export const distance = ([x1, y1]: Pos, [x2, y2]: Pos): number =>
  Math.abs(x1 - x2) + Math.abs(y1 - y2);

const renderMap = (
  map: Map,
  robot: Pos,
  options?: {
    endPath?: Pos;
    path?: string[];
  }
) => {
  let s = "";

  const minX = parseKey(_.minBy(Object.keys(map), key => parseKey(key)[0]))[0];
  const maxX = parseKey(_.maxBy(Object.keys(map), key => parseKey(key)[0]))[0];

  const minY = parseKey(_.minBy(Object.keys(map), key => parseKey(key)[1]))[1];
  const maxY = parseKey(_.maxBy(Object.keys(map), key => parseKey(key)[1]))[1];

  for (let y = minY - 1; y <= maxY + 1; y += 1) {
    for (let x = minX - 1; x <= maxX + 1; x += 1) {
      if (robot[0] === x && robot[1] === y) {
        s += "D";
      } else if (
        options &&
        options.endPath &&
        options.endPath[0] === x &&
        options.endPath[1] === y
      ) {
        s += "E";
      } else if (
        options &&
        options.path &&
        options.path.includes(key([x, y]))
      ) {
        s += "X";
      } else {
        const tile = map[key([x, y])];

        if (tile == null) {
          s += " ";
        } else if (tile === Tile.Wall) {
          s += "█";
        } else if (tile === Tile.Floor) {
          s += ".";
        } else if (tile === Tile.Oxygen) {
          s += "O";
        }
      }
    }

    s += "\n";
  }

  // clear();
  console.log({ robot, minX, maxX, minY, maxY });
  console.log(s);
};

const move = ([x, y]: Pos, dir: Direction): Pos => {
  if (dir === Direction.North) {
    return [x, y - 1];
  } else if (dir === Direction.South) {
    return [x, y + 1];
  } else if (dir === Direction.East) {
    return [x + 1, y];
  } else if (dir === Direction.West) {
    return [x - 1, y];
  }
};

const findClosestUnexplored = (map: Map, robot: Pos): Pos | undefined => {
  const floors = Object.entries(map).filter(
    ([p, t]) => t === Tile.Floor && p !== key(robot)
  );

  const unvisited: Pos[] = [];

  for (const [posS, _t] of floors) {
    const pos = parseKey(posS);
    const neighbours = getNeighbours(pos, p => map[key(p)] != null);

    neighbours.forEach(n => unvisited.push(n));
  }

  const closest = _.sortBy(unvisited, p => distance(robot, p))[0];

  return closest;
};

const directionTo = (start: Pos, end: Pos): Direction => {
  if (end[0] < start[0]) {
    return Direction.West;
  } else if (end[0] > start[0]) {
    return Direction.East;
  } else if (end[1] < start[1]) {
    return Direction.North;
  } else if (end[1] > start[1]) {
    return Direction.South;
  }
};

const findNextDirection = async (
  map: Map,
  robot: Pos
): Promise<Direction | null> => {
  const dirs = [
    Direction.North,
    Direction.West,
    Direction.East,
    Direction.South
  ];
  const neighbours = dirs.map(d => ({ d, t: map[key(move(robot, d))] }));

  // find unexplored area from where we are
  const unExplored = neighbours.filter(n => n.t == null);
  if (unExplored.length > 0) {
    return unExplored[0].d;
  }

  const closest = findClosestUnexplored(map, robot);

  if (closest == null) {
    return null;
  }

  const path = findPath(
    robot,
    closest,
    p => !(map[key(p)] === Tile.Floor || map[key(p)] === Tile.Oxygen)
  );
  const dir = directionTo(robot, path[0]);

  // console.log({ next: path[0], robot, dir });
  // await new Promise(r => setTimeout(r, 1000));

  return dir;
};

const exploreMap = async (program: Memory) => {
  let robot: Pos = [0, 0];
  const map: Map = {
    [key(robot)]: Tile.Floor
  };
  let dir: Direction = Direction.North;
  let oxygen: Pos = robot;

  const requestInput = async (): Promise<number | null> => {
    dir = await findNextDirection(map, robot);

    // renderMap(map, robot);
    // await new Promise(r => setTimeout(r, 10));

    return dir;
  };

  const receiveOutput = (value: number) => {
    if (value === Status.HitWall) {
      map[key(move(robot, dir))] = Tile.Wall;
    } else if (value === Status.Moved) {
      robot = move(robot, dir);
      map[key(robot)] = Tile.Floor;
    } else if (value === Status.MovedAndFound) {
      robot = move(robot, dir);
      map[key(robot)] = Tile.Oxygen;
      oxygen = [...robot] as Pos;
    }
  };

  await execute(program, {
    requestInput,
    receiveOutput
  });

  return {
    map,
    oxygen
  };
};

export const solveP1 = async (input: string) => {
  const program = parseProgram(input);

  const { map, oxygen } = await exploreMap(program);

  const path = findPath(
    [0, 0],
    oxygen,
    p => !(map[key(p)] === Tile.Floor || map[key(p)] === Tile.Oxygen)
  );

  const fewestCommands = path.length;
  return fewestCommands;
};

const fillWithOxygen = async (
  map: Map,
  ellapsed: number = 0
): Promise<number> => {
  // await new Promise(r => setTimeout(r, 20));
  // renderMap(map, [0, 0]);

  const isDone =
    Object.entries(map).filter(([p, t]) => t === Tile.Floor).length === 0;

  if (isDone) {
    return ellapsed;
  }

  const oxygens = Object.entries(map).filter(([p, t]) => t === Tile.Oxygen);

  for (const [posS] of oxygens) {
    const pos = parseKey(posS);
    const neighbours = getNeighbours(pos, p => map[key(p)] !== Tile.Floor);

    neighbours.forEach(n => {
      map[key(n)] = Tile.Oxygen;
    });
  }

  return fillWithOxygen(map, ellapsed + 1);
};

export const solveP2 = async (input: string) => {
  const program = parseProgram(input);

  const { map, oxygen } = await exploreMap(program);

  const minutes = await fillWithOxygen(map);
  return minutes;
};
