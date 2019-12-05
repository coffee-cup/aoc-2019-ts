import { solveP1, solveP2 } from ".";
import * as fs from "fs";
import * as path from "path";

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

describe("day2", () => {
  it("p1", () => {
    expect(solveP1(input)).toBe(6087827);
  });

  it("p2", () => {
    expect(solveP2(input)).toBe(5379);
  });
});
