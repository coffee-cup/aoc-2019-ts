import _ from "lodash";
import * as fs from "fs";
import * as path from "path";

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

interface Pos {
  x: number;
  y: number;
}

interface Cell {
  portal?: {
    code: string;
    to: Pos;
  };
  pos: Pos;
  links: Cell[];
}

type IMap = { [key: string]: Cell };
type Portals = { [key: string]: Cell[] };

const getNeighbours = ({ x, y }: Pos): Pos[] => [
  { x: x, y: y - 1 },
  { x: x, y: y + 1 },
  { x: x - 1, y: y },
  { x: x + 1, y: y }
];

const key = (pos: Pos): string => `${pos.x},${pos.y}`;

const parseInput = (input: string) => {
  const grid = input
    .split("\n")
    .map(l => l.split(""))
    .filter(l => l.length !== 0);

  const map: IMap = {};
  const portals: Portals = {};

  console.log(input);

  const isValidPos = (pos: Pos): boolean =>
    pos.y >= 0 && pos.y < grid.length && pos.x >= 0 && pos.x < grid[0].length;

  const isBesideFloor = (pos: Pos): boolean =>
    getNeighbours(pos).filter(p => isValidPos(p) && grid[p.y][p.x] === ".")
      .length > 0;

  const isPortalChar = (t: string): boolean =>
    t !== " " && t !== "." && t !== "#";

  const isPortal = (pos: Pos): boolean => {
    const t = grid[pos.y][pos.x];
    return isPortalChar(t);
  };

  const isFloor = (pos: Pos): boolean => grid[pos.y][pos.x] === ".";

  const findAdjacent = (pos: Pos): Pos[] =>
    getNeighbours(pos).filter(p => isValidPos(p) && grid[p.y][p.x] === ".");

  const readPortal = (pos: Pos): string => {
    const neighbours = getNeighbours(pos).filter(p =>
      isPortalChar(grid[p.y][p.x])
    );

    if (neighbours.length !== 1) {
      throw new Error("read protal error");
    }

    const neigh = neighbours[0];
    const isTopDown = neigh.x === pos.x;

    if (isTopDown) {
      const min = Math.min(pos.y, neigh.y);
      return `${grid[min][pos.x]}${grid[min + 1][pos.x]}`;
    } else {
      const min = Math.min(pos.x, neigh.x);
      return `${grid[pos.y][min]}${grid[pos.y][min + 1]}`;
    }
  };

  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[0].length; x += 1) {
      const pos = { x, y };

      if (isFloor(pos)) {
        const cell: Cell = {
          pos,
          links: []
        };

        map[key(cell.pos)] = cell;
      } else if (isPortal(pos) && isBesideFloor(pos)) {
        const portal = readPortal(pos);
        const adjacent = findAdjacent(pos)[0];

        const cell: Cell = {
          pos,
          portal: {
            code: portal,
            to: adjacent
          },
          links: []
        };

        // map[key(cell.pos)] = cell;

        if (portals[portal] == null) {
          portals[portal] = [];
        }
        portals[portal].push(cell);
      }
    }
  }

  // create connections
  Object.values(map).forEach(cell => {
    const neighbours = getNeighbours(cell.pos);

    neighbours.forEach(n => {
      const nCell = map[`${n.x},${n.y}`];
      if (nCell != null) {
        cell.links.push(nCell);
      }
    });
  });

  let start: Cell;
  let end: Cell;

  // connect portals
  Object.keys(portals).forEach(portal => {
    const cells = portals[portal];
    if (portal === "AA") {
      const to = cells[0].portal.to;
      start = map[key(to)];
    } else if (portal === "ZZ") {
      const to = cells[0].portal.to;
      end = map[key(to)];
    } else {
      const c1 = cells[0];
      const c2 = cells[1];

      const t1 = map[key(c1.portal.to)];
      const t2 = map[key(c2.portal.to)];

      t1.links.push(t2);
      t2.links.push(t1);
    }
  });

  return { map, start, end };
};

const findPath = (map: IMap, start: Cell, end: Cell) => {
  const cells: Map<Cell, number> = new Map();
  cells.set(start, 0);

  const unvisited: Set<Cell> = new Set([start]);

  while (unvisited.size !== 0) {
    for (const cell of unvisited) {
      for (const linked of cell.links) {
        if (!cells.has(linked)) {
          cells.set(linked, cells.get(cell)! + 1);

          unvisited.add(linked);
        }
      }

      unvisited.delete(cell);
    }
  }

  const breadcrumbs: Cell[] = [];

  let current = end;
  while (current !== start) {
    breadcrumbs.push(current);

    let bestNeighbour = current;
    let bestDistance = cells.get(current)!;
    for (const cell of current.links) {
      if (cells.get(cell)! < bestDistance) {
        bestDistance = cells.get(cell)!;
        bestNeighbour = cell;
      }
    }

    current = bestNeighbour;
  }

  breadcrumbs.push(current);

  console.log(breadcrumbs);
  return breadcrumbs;
};

export const solveP1 = (input: string) => {
  const { map, start, end } = parseInput(input);
  console.log({ start, end });

  const path = findPath(map, start, end);
  const length = path.length - 1;

  console.log(length);
};

// const input = `
//                    A
//                    A
//   #################.#############
//   #.#...#...................#.#.#
//   #.#.#.###.###.###.#########.#.#
//   #.#.#.......#...#.....#.#.#...#
//   #.#########.###.#####.#.#.###.#
//   #.............#.#.....#.......#
//   ###.###########.###.#####.#.#.#
//   #.....#        A   C    #.#.#.#
//   #######        S   P    #####.#
//   #.#...#                 #......VT
//   #.#.#.#                 #.#####
//   #...#.#               YN....#.#
//   #.###.#                 #####.#
// DI....#.#                 #.....#
//   #####.#                 #.###.#
// ZZ......#               QG....#..AS
//   ###.###                 #######
// JO..#.#.#                 #.....#
//   #.#.#.#                 ###.#.#
//   #...#..DI             BU....#..LF
//   #####.#                 #.#####
// YN......#               VT..#....QG
//   #.###.#                 #.###.#
//   #.#...#                 #.....#
//   ###.###    J L     J    #.#.###
//   #.....#    O F     P    #.#...#
//   #.###.#####.#.#####.#####.###.#
//   #...#.#.#...#.....#.....#.#...#
//   #.#####.###.###.#.#.#########.#
//   #...#.#.....#...#.#.#.#.....#.#
//   #.###.#####.###.###.#.#.#######
//   #.#.........#...#.............#
//   #########.###.###.#############
//            B   J   C
//            U   P   P
// `;

solveP1(input);
