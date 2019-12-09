import { solve } from ".";
import fs from "fs";
import path from "path";

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

describe("day9", () => {
  it("p1", async () => {
    const result = await solve(input, 1);
    expect(result).toBe(3380552333);
  });

  it("p2", async () => {
    const result = await solve(input, 2);
    expect(result).toBe(78831);
  });
});
