import { solveP1, solveP2 } from ".";
import fs from "fs";
import path from "path";

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

describe("day3", () => {
  it("p1: sample inputs", () => {
    expect(
      solveP1(`
R8,U5,L5,D3
U7,R6,D4,L4
`)
    ).toBe(6);

    expect(
      solveP1(`
R75,D30,R83,U83,L12,D49,R71,U7,L72
U62,R66,U55,R34,D71,R55,D58,R83
`)
    ).toBe(159);

    expect(
      solveP1(`
R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51
U98,R91,D20,R16,D67,R40,U7,R15,U6,R7
`)
    ).toBe(135);
  });

  it("p1", () => {
    const p1 = solveP1(input);
    expect(p1).toBe(403);
  });

  it("p2: sample inputs", () => {
    expect(
      solveP2(`
R8,U5,L5,D3
U7,R6,D4,L4
`)
    ).toBe(30);

    expect(
      solveP2(`
R75,D30,R83,U83,L12,D49,R71,U7,L72
U62,R66,U55,R34,D71,R55,D58,R83
`)
    ).toBe(610);

    expect(
      solveP2(`
R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51
U98,R91,D20,R16,D67,R40,U7,R15,U6,R7
`)
    ).toBe(410);
  });

  it("p2", () => {
    const p2 = solveP2(input);
    expect(p2).toBe(4158);
  });
});
