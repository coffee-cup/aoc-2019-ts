import { solveP1, solveP2 } from ".";
import * as fs from "fs";
import * as path from "path";

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

describe("day13", () => {
  it("p1", async () => {
    const result = await solveP1(input);
    expect(result).toBe(19357335);
  });

  it("p2", async () => {
    const result = await solveP2(input);
    expect(result).toBe(1140147758);
  });
});
