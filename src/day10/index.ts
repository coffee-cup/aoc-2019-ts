import _ from "lodash";

type Pos = {
  x: number;
  y: number;
};

const parseInput = (input: string): Pos[] =>
  _.flatten(
    input
      .trim()
      .split("\n")
      .map((line, row) =>
        line.split("").map((char, col) =>
          char === "#"
            ? {
                x: col,
                y: row
              }
            : null
        )
      )
  ).filter(Boolean);

const findStation = (input: string): Pos => {
  const lines = input.trim().split("\n");

  for (let row = 0; row < lines.length; row += 1) {
    const cells = lines[row].split("");
    for (let col = 0; col < cells.length; col += 1) {
      if (cells[col] === "X") {
        return { x: col, y: row };
      }
    }
  }

  throw new Error("Station not found");
};

const distance = ({ x: x1, y: y1 }: Pos, { x: x2, y: y2 }: Pos): number =>
  Math.abs(x1 - x2) + Math.abs(y1 - y2);

const isBlocked = (origin: Pos, target: Pos, astroids: Pos[]): boolean => {
  const shiftedTarget = { x: target.x - origin.x, y: target.y - origin.y };
  const angle = Math.atan2(shiftedTarget.y, shiftedTarget.x);

  const inLOS: Pos[] = [target];

  for (const roid of astroids) {
    const shiftedRoid = { x: roid.x - origin.x, y: roid.y - origin.y };
    const roidAngle = Math.atan2(shiftedRoid.y, shiftedRoid.x);
    const sameAngle = angle === roidAngle;

    if (sameAngle) {
      inLOS.push(roid);
    }
  }

  const sortedLOS = _.sortBy(inLOS, [p => distance(origin, p)]);
  const isClosest = sortedLOS[0].x === target.x && sortedLOS[0].y === target.y;

  return !isClosest;
};

const canSee = (origin: Pos, astroids: Pos[]): number => {
  const possible = astroids.filter(
    a => !(a.x === origin.x && a.y === origin.y)
  );
  let num = possible.length;

  for (const target of possible) {
    if (isBlocked(origin, target, possible)) {
      num -= 1;
    }
  }

  return num;
};

export const solveP1 = (input: string) => {
  const astroids = parseInput(input);

  let max = -Infinity;
  let loc = astroids[0];

  for (const roid of astroids) {
    const num = canSee(roid, astroids);
    if (num > max) {
      max = num;
      loc = roid;
    }
  }

  return { max, loc };
};

const findVisibleRoids = (station: Pos, astroids: Pos[]): Pos[] => {
  const visible: Pos[] = [];

  for (const roid of astroids) {
    if (!isBlocked(station, roid, astroids)) {
      visible.push(roid);
    }
  }

  return visible;
};

const angle = (station: Pos, roid: Pos): number => {
  const shifted = {
    x: roid.x - station.x,
    y: roid.y - station.y
  };

  const rad = Math.atan2(shifted.y, shifted.x) + Math.PI / 2;
  const angle = ((rad >= 0 ? rad : 2 * Math.PI + rad) * 180) / Math.PI;
  return angle;
};

const findNextTarget = (
  station: Pos,
  visible: Pos[]
): { roid: Pos; angle: number } => {
  const next = _.sortBy(visible, [roid => angle(station, roid)])[0];
  return {
    roid: next,
    angle: angle(station, next)
  };
};

export const solveP2 = (input: string) => {
  let astroids = parseInput(input);
  const station = solveP1(input).loc;

  let num = 0;
  let previousAngle = -1;
  let bet = station;

  while (astroids.length !== 0) {
    const visible = findVisibleRoids(station, astroids);
    const potential = visible.filter(
      roid => angle(station, roid) > previousAngle
    );

    if (potential.length === 0) {
      previousAngle = -1;
    } else {
      const { roid, angle } = findNextTarget(station, potential);

      num += 1;
      if (num === 200) {
        bet = roid;
        break;
      }

      previousAngle = angle;

      astroids = astroids.filter(a => !(a.x === roid.x && a.y === roid.y));
    }
  }

  return bet.x * 100 + bet.y;
};
