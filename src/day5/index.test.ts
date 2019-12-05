import { solve } from ".";
import fs from "fs";
import path from "path";

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

describe("day5", () => {
  it("p1", () => {
    const code = solve(input, 1);
    expect(code).toBe(7692125);
  });

  it("p2", () => {
    const code = solve(input, 5);
    expect(code).toBe(14340395);
  });
});
