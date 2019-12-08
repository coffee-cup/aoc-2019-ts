import { solveP1, solveP2, render } from ".";
import fs from "fs";
import path from "path";

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

describe("day8", () => {
  it("p1", () => {
    const result = solveP1(input);
    expect(result).toBe(2375);
  });

  it("p2", () => {
    const result = solveP2(input);
    expect(result).toMatchInlineSnapshot(`
      "███  █  █ █  █ ███  █   █
      █  █ █ █  █  █ █  █ █   █
      █  █ ██   ████ █  █  █ █ 
      ███  █ █  █  █ ███    █  
      █ █  █ █  █  █ █ █    █  
      █  █ █  █ █  █ █  █   █  
      "
    `);
  });
});
