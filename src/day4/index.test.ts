import { solveP1, solveP2, meetsCriteriaP1, meetsCriteriaP2 } from ".";

describe("day4", () => {
  it("p1 sample inputs", () => {
    expect(meetsCriteriaP1(111111)).toBe(true);
    expect(meetsCriteriaP1(223450)).toBe(false);
    expect(meetsCriteriaP1(123789)).toBe(false);
  });

  it("p1", () => {
    const count = solveP1("359282-820401");
    expect(count).toBe(511);
  });

  it("p2 sample inputs", () => {
    expect(meetsCriteriaP2(112233)).toBe(true);
    expect(meetsCriteriaP2(123444)).toBe(false);
    expect(meetsCriteriaP2(111122)).toBe(true);
  });

  it("p1", () => {
    const count = solveP2("359282-820401");
    expect(count).toBe(316);
  });
});
