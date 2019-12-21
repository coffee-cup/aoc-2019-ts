import * as fs from "fs";
import * as path from "path";
import _ from "lodash";
import { parseProgram, execute, Memory } from "../intcode";
import clear from "clear";

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

const a = "A";
const b = "B";
const c = "C";
const d = "D";
const e = "E";
const f = "F";
const g = "G";
const h = "H";
const i = "I";

const t = "T";
const j = "J";

const isHole = (v: string, r: string) =>
  `
NOT ${v} ${r}
`.trim();

const isGround = (v: string, r: string) =>
  `
NOT ${v} ${r}
NOT ${r} ${r}
`.trim();

const and = (v: string, r: string) =>
  `
AND ${v} ${r}
`.trim();

const or = (v: string, r: string) =>
  `
OR ${v} ${r}
`.trim();

const not = (v: string, r: string) =>
  `
NOT ${v} ${r}
`.trim();

export const solveP1 = async (input: string) => {
  const program = parseProgram(input);

  // (C & !D) || A
  let springscript = [
    // if @ab.#
    isHole(c, t),
    isGround(d, j),
    and(t, j),

    // if @.
    isHole(a, t),
    or(t, j),
    "WALK",
    ""
  ]
    .join("\n")
    .trimLeft();

  // console.log(springscript);

  let damage = 0;

  const requestInput = async (): Promise<number> => {
    const c = springscript[0];
    springscript = springscript.slice(1);

    return c.charCodeAt(0);
  };

  const receiveOutput = (value: number) => {
    if (value < 300) {
      const c = String.fromCharCode(value);
      // process.stdout.write(c);
    } else {
      damage = value;
    }
  };

  await execute(program, {
    requestInput,
    receiveOutput
  });

  return damage;
};

export const solveP2 = async (input: string) => {
  const program = parseProgram(input);

  let springscript = [
    or(a, j),
    and(b, j),
    and(c, j),
    not(j, j),
    and(d, j),
    or(e, t),
    or(h, t),
    or(h, t),
    and(t, j),

    "RUN",
    ""
  ]
    .join("\n")
    .trimLeft();

  // console.log(springscript);

  let damage = 0;

  const requestInput = async (): Promise<number> => {
    const c = springscript[0];
    springscript = springscript.slice(1);

    return c.charCodeAt(0);
  };

  const receiveOutput = (value: number) => {
    if (value < 300) {
      const c = String.fromCharCode(value);
      // process.stdout.write(c);
    } else {
      damage = value;
    }
  };

  await execute(program, {
    requestInput,
    receiveOutput
  });

  return damage;
};

solveP2(input);
