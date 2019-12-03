import _ from "lodash";

type Pos = [number, number];
type Path = Pos[];
type PathObj = { [key: string]: [number, number] };
type Wire = Array<[string, number]>;

const parseItem = (s: string): [string, number] => {
  const dir = s.substring(0, 1);
  const length = parseInt(s.substring(1), 10);
  return [dir, length];
};

const parseInput = (input: string) =>
  input
    .trim()
    .split("\n")
    .map(w => w.split(",").map(parseItem));

const buildWirePath = (
  wire: Wire
): {
  path: Path;
  pathObj: PathObj;
} => {
  const path: Path = [];
  const pathObj: PathObj = {};
  let lastPos: Pos = [0, 0];

  for (const [dir, length] of wire) {
    let newPos = lastPos;

    _.range(length).forEach(() => {
      if (dir === "U") {
        newPos = [lastPos[0], lastPos[1] - 1];
      } else if (dir === "R") {
        newPos = [lastPos[0] + 1, lastPos[1]];
      } else if (dir === "D") {
        newPos = [lastPos[0], lastPos[1] + 1];
      } else if (dir === "L") {
        newPos = [lastPos[0] - 1, lastPos[1]];
      }

      pathObj[`${newPos[0]},${newPos[1]}`] = newPos;
      path.push(newPos);
      lastPos = newPos;
    });
  }

  return {
    path,
    pathObj
  };
};

const findIntersections = (paths: PathObj[]) => {
  const intersections: Array<[number, number]> = [];

  Object.entries(paths[0]).map(([key, p]) => {
    const intersects = _.every(paths.slice(1), path => {
      return path[key] != null;
    });

    if (intersects) {
      intersections.push(p);
    }
  });

  return intersections;
};

const distance = ([x1, y1]: Pos, [x2, y2]: Pos): number =>
  Math.abs(x1 - x2) + Math.abs(y1 - y2);

const distanceToVisit = (target: Pos, path: Path): number => {
  const [targetX, targetY] = target;

  let d = 0;
  for (const [x, y] of path) {
    d += 1;
    if (x === targetX && y === targetY) {
      break;
    }
  }

  return d;
};

export const solveP1 = (input: string) => {
  const wires = parseInput(input);

  const paths = wires.map(w => buildWirePath(w).pathObj);
  const intersections = findIntersections(paths);
  const distances = _.sortBy(intersections.map(p => distance(p, [0, 0])));

  return distances[0];
};

export const solveP2 = (input: string) => {
  const wires = parseInput(input);
  const pathInfo = wires.map(buildWirePath);
  const intersections = findIntersections(pathInfo.map(p => p.pathObj));

  const distances = _.sortBy(
    intersections.map(target => {
      const paths = pathInfo.map(p => p.path);
      return _.sum(paths.map(path => distanceToVisit(target, path)));
    })
  );

  return distances[0];
};
