import _ from "lodash";
import { testExample, smallExample, largeExample, full } from "./inputs";

interface Pos {
  x: number;
  y: number;
}

interface Link {
  cell: Cell;
  depthChange: number;
}

interface Cell {
  portal?: {
    code: string;
    to: Pos;
    inner: boolean;
  };
  pos: Pos;
  links: Link[];
  parent?: Cell;
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

const distance = ({ x: x1, y: y1 }: Pos, { x: x2, y: y2 }: Pos): number =>
  Math.abs(x1 - x2) + Math.abs(y1 - y2);

const parseInput = (input: string) => {
  const grid = input
    .split("\n")
    .map(l => l.split(""))
    .filter(l => l.length !== 0);

  const map: IMap = {};
  const portals: Portals = {};

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
      throw new Error("read portal error");
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

        if (grid[adjacent.y][adjacent.x] !== ".") {
          throw new Error("adjacent not valid path");
        }

        const cell: Cell = {
          pos,
          portal: {
            code: portal,
            to: adjacent,
            inner: false
          },
          links: []
        };

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
        cell.links.push({
          cell: nCell,
          depthChange: 0
        });
      }
    });
  });

  let start: Cell;
  let end: Cell;

  const center: Pos = {
    x: Math.floor(grid[0].length / 2),
    y: Math.floor(grid.length / 2)
  };

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

      if (distance(center, c1.pos) < distance(center, c2.pos)) {
        // c1 is inner
        c1.portal.inner = true;
      } else {
        c2.portal.inner = true;
      }

      const t1 = map[key(c1.portal.to)];
      const t2 = map[key(c2.portal.to)];

      // from t1 to t2
      const t1DepthChange = c1.portal.inner ? 1 : -1;
      t1.links.push({
        depthChange: t1DepthChange,
        cell: t2
      });

      // from t2 to t1
      const t2DepthChange = c2.portal.inner ? 1 : -1;
      t2.links.push({
        depthChange: t2DepthChange,
        cell: t1
      });

      if (t1DepthChange === t2DepthChange) {
        throw new Error("Depth changes for portals cannot be the same");
      }
    }
  });

  return { map, start, end };
};

const findPathPortals = (map: IMap, start: Cell, end: Cell) => {
  const distances: Map<Cell, number> = new Map();
  const unvisited: Set<Cell> = new Set([start]);
  const allCells: Set<Cell> = new Set([start]);

  distances.set(start, 0);

  const getDist = (cell: Cell) =>
    distances.has(cell) ? distances.get(cell) : Infinity;

  while (unvisited.size !== 0) {
    const closest = _.minBy([...unvisited], c => getDist(c));

    unvisited.delete(closest);

    const neighbours = closest.links;
    neighbours.forEach(link => {
      const neighbour = link.cell;
      if (!allCells.has(neighbour)) {
        allCells.add(neighbour);
        unvisited.add(neighbour);
      }

      const dist = getDist(closest) + 1;
      if (dist < getDist(neighbour)) {
        distances.set(neighbour, dist);
      }
    });
  }

  const breadcrumbs: Cell[] = [];

  let current = end;
  while (current !== start) {
    breadcrumbs.push(current);

    let bestNeighbour = current;
    let bestDistance = distances.get(current)!;
    for (const { cell } of current.links) {
      if (distances.get(cell)! < bestDistance) {
        bestDistance = distances.get(cell)!;
        bestNeighbour = cell;
      }
    }

    current = bestNeighbour;
  }

  breadcrumbs.push(current);

  return breadcrumbs;
};

export const solveP1 = (input: string) => {
  const { map, start, end } = parseInput(input);

  const path = findPathPortals(map, start, end);
  const length = path.length - 1;

  return length;
};

const findPathRecursive = (map: IMap, start: Cell, end: Cell) => {
  const queue: string[] = [];
  const discovered: Set<string> = new Set();

  const isFinished = (cell: Cell, depth: number) =>
    depth === 0 && cell.pos.x === end.pos.x && cell.pos.y === end.pos.y;

  const isValidLink = (link: Link, depth: number) =>
    link.depthChange >= 0 || depth >= 0;

  const markDiscovered = (cell: Cell, depth: number) =>
    discovered.add(`${cell.pos.x},${cell.pos.y},${depth}`);

  const isDiscovered = (cell: Cell, depth: number) =>
    discovered.has(`${cell.pos.x},${cell.pos.y},${depth}`);

  const enqueue = (cell: Cell, depth: number, distance: number) =>
    queue.push(`${cell.pos.x},${cell.pos.y},${depth},${distance}`);

  const dequeue = (): [Cell, number, number] => {
    const k = queue.shift();
    const [x, y, depth, distance] = k.split(",").map(n => parseInt(n, 10));
    const cell = map[key({ x, y })];
    return [cell, depth, distance];
  };

  enqueue(start, 0, 0);
  markDiscovered(start, 0);

  while (queue.length !== 0) {
    const [cell, depth, distance] = dequeue();

    markDiscovered(cell, depth);

    if (depth < 0) {
      throw new Error("cannot go to -1");
    }

    if (isFinished(cell, depth)) {
      return distance;
    }

    for (const link of cell.links) {
      const newDepth = depth + link.depthChange;

      if (newDepth > 200) {
        continue;
      }

      if (isValidLink(link, newDepth)) {
        if (!isDiscovered(link.cell, newDepth)) {
          // link.cell.parent = cell;

          enqueue(link.cell, newDepth, distance + 1);
        }
      }
    }
  }

  throw new Error("path not found");
};

export const solveP2 = (input: string) => {
  const { map, start, end } = parseInput(input);

  const distance = findPathRecursive(map, start, end);

  return distance;
};

// solveP2(full);
