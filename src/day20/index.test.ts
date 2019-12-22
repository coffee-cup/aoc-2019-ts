import { solveP1, solveP2 } from ".";
import { full } from "./inputs";

describe("day20", () => {
  it("p1", async () => {
    const result = solveP1(full);
    expect(result).toBe(454);
  });

  it("p2", async () => {
    const result = solveP2(full);
    expect(result).toBe(5744);
  });
});
