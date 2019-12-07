import { solveP1, solveP2 } from ".";
import fs from "fs";
import path from "path";

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

describe("day6", () => {
  it("p1 sample", () => {
    const input = `
COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L
`;

    const result = solveP1(input);
    expect(result).toBe(42);
  });

  it("p1", () => {
    const result = solveP1(input);
    expect(result).toBe(247089);
  });

  it("p2 sample", () => {
    const input = `
COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L
K)YOU
I)SAN
`;

    const result = solveP2(input);
    expect(result).toBe(4);
  });

  it("p2", () => {
    const result = solveP2(input);
    expect(result).toBe(442);
  });
});
