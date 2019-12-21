import _ from "lodash";

export type Pos = [number, number];

interface Node {
  pos: Pos;
}

const key = ([x, y]: [number, number]): string => `${x},${y}`;

const parseKey = (key: string): [number, number] => {
  const [xs, ys] = key.split(",");
  return [parseInt(xs, 10), parseInt(ys, 10)];
};

export const getNeighbours = (
  [x, y]: Pos,
  isBlocked: (pos: Pos) => boolean
): Pos[] => {
  const nodes: Pos[] = [
    [x, y - 1] as Pos,
    [x, y + 1] as Pos,
    [x - 1, y] as Pos,
    [x + 1, y] as Pos
  ].filter(p => !isBlocked(p));

  return nodes;
};

export const findPath = (
  start: Pos,
  end: Pos,
  isBlocked: (pos: Pos) => boolean
): Pos[] => {
  const nodes: Map<string, number> = new Map();

  nodes.set(key(start), 0);

  const unvisited: Set<string> = new Set([key(start)]);

  while (unvisited.size !== 0) {
    for (const cellS of unvisited) {
      const cell = parseKey(cellS);
      const neighbours = getNeighbours(cell, isBlocked);

      for (const linked of neighbours) {
        const linkedS = key(linked);
        if (!nodes.has(linkedS)) {
          nodes.set(linkedS, nodes.get(cellS)! + 1);

          unvisited.add(linkedS);
        }
      }

      unvisited.delete(cellS);
    }
  }

  const path: string[] = [];
  const startS = key(start);
  const endS = key(end);
  let currentS = endS;

  while (currentS !== startS) {
    path.push(currentS);

    let bestNeighbour = currentS;
    let bestScore = Infinity;

    const neighbours = getNeighbours(parseKey(currentS), isBlocked).filter(
      n => !path.includes(key(n))
    );

    if (neighbours.length === 0) {
      throw new Error("no neighbours");
    }

    for (const linked of neighbours) {
      const linkedS = key(linked);

      const score = nodes.get(linkedS);
      if (score < bestScore) {
        bestScore = score;
        bestNeighbour = linkedS;
      }
    }

    currentS = bestNeighbour;
  }

  return path.reverse().map(s => parseKey(s));
};
