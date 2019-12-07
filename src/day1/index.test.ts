import { solveP1, solveP2 } from ".";
import * as fs from "fs";
import * as path from "path";

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

describe("day1", () => {
  it("p1", () => {
    expect(solveP1(input)).toBe(3336439);
  });

  it("p2", () => {
    expect(solveP2(input)).toBe(5001791);
  });
});
