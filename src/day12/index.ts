import _ from "lodash";
import { lcm } from "../utils";

type Vec = [number, number, number];

interface Moon {
  pos: Vec;
  vel: Vec;
}

const createMoon = (pos: Vec): Moon => ({
  pos,
  vel: [0, 0, 0]
});

const parseInput = (input: string): Moon[] => {
  const regex = /x=(.+), y=(.+), z=(.+)>/;
  return input
    .trim()
    .split("\n")
    .map(l => {
      const m = regex.exec(l);
      const s = [m[1], m[2], m[3]];
      return createMoon(s.map(n => parseInt(n, 10)) as Vec);
    });
};

const updateOnAxis = (m1: Moon, m2: Moon, i: number) => {
  if (m1.pos[i] > m2.pos[i]) {
    m1.vel[i] -= 1;
    m2.vel[i] += 1;
  } else if (m1.pos[i] < m2.pos[i]) {
    m1.vel[i] += 1;
    m2.vel[i] -= 1;
  }
};

const applyGravity = (moons: Moon[]) => {
  for (let i = 0; i < moons.length; i += 1) {
    for (let j = i + 1; j < moons.length; j += 1) {
      const m1 = moons[i];
      const m2 = moons[j];

      // console.log({ m1, m2 });
      // console.log({ i, j });

      // larger -1, smaller +1

      updateOnAxis(m1, m2, 0);
      updateOnAxis(m1, m2, 1);
      updateOnAxis(m1, m2, 2);
    }
  }
};

const applyVelocity = (moons: Moon[]) => {
  for (const m of moons) {
    m.pos[0] += m.vel[0];
    m.pos[1] += m.vel[1];
    m.pos[2] += m.vel[2];
  }
};

const potEnergy = (moon: Moon): number => _.sum(moon.pos.map(Math.abs));

const kinEnergy = (moon: Moon): number => _.sum(moon.vel.map(Math.abs));

const totalEnergy = (moon: Moon): number => potEnergy(moon) * kinEnergy(moon);

export const solveP1 = (input: string, steps: number) => {
  const moons = parseInput(input);

  for (let i = 1; i <= steps; i += 1) {
    applyGravity(moons);
    applyVelocity(moons);
  }

  const energy = _.sum(moons.map(totalEnergy));

  return energy;
};

const sameAsOriginalAxis = (axis: number, originals: Moon[], moons: Moon[]) => {
  return (
    _.every(moons, (m, i) => m.pos[axis] === originals[i].pos[axis]) &&
    _.every(moons, (m, i) => m.vel[axis] === originals[i].vel[axis])
  );
};

const attemptPatternFind = (moons: Moon[]) => {
  const originals = JSON.parse(JSON.stringify(moons));

  const step = () => {
    applyGravity(moons);
    applyVelocity(moons);
  };

  const zeros: { [id: string]: number[] } = {
    x: [],
    y: [],
    z: []
  };

  const xSame = [];
  const ySame = [];
  const zSame = [];

  for (let i = 0; i <= 1000000; i += 1) {
    step();

    if (sameAsOriginalAxis(0, originals, moons)) {
      xSame.push(i);
      zeros.x.push(i);
    }

    if (sameAsOriginalAxis(1, originals, moons)) {
      ySame.push(i);
      zeros.y.push(i);
    }

    if (sameAsOriginalAxis(2, originals, moons)) {
      zSame.push(i);
      zeros.z.push(i);
    }

    const enough = _.every(Object.values(zeros), l => l.length >= 100);
    if (enough) {
      break;
    }
  }

  const findPattern = (index: number) => {
    const l = [];
    const patt = [...Object.values(zeros)[index]];
    for (let i = 1; i < patt.length; i += 1) {
      l.push(patt[i] - patt[i - 1]);
    }

    return l;
  };

  return [findPattern(0)[0], findPattern(1)[0], findPattern(2)[0]];
};

export const solveP2 = (input: string) => {
  const moons = parseInput(input);

  const [x, y, z] = attemptPatternFind(moons);
  const lowest = lcm([x, y, z]);

  return lowest;
};
