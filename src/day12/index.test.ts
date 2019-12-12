import { solveP1, solveP2 } from ".";

const input = `
<x=13, y=-13, z=-2>
<x=16, y=2, z=-15>
<x=7, y=-18, z=-12>
<x=-3, y=-8, z=-8>
`;

describe("day12", () => {
  it("p1 samples", () => {
    expect(
      solveP1(
        `
<x=-1, y=0, z=2>
<x=2, y=-10, z=-7>
<x=4, y=-8, z=8>
<x=3, y=5, z=-1>
`,
        10
      )
    ).toBe(179);

    expect(
      solveP1(
        `
<x=-8, y=-10, z=0>
<x=5, y=5, z=10>
<x=2, y=-7, z=3>
<x=9, y=-8, z=-3>
`,
        100
      )
    ).toBe(1940);
  });

  it("p1", () => {
    const result = solveP1(input, 1000);
    expect(result).toBe(12082);
  });

  it("p2 samples", () => {
    expect(
      solveP2(
        `
<x=-1, y=0, z=2>
<x=2, y=-10, z=-7>
<x=4, y=-8, z=8>
<x=3, y=5, z=-1>
`
      )
    ).toBe(2772);

    expect(
      solveP2(
        `
<x=-8, y=-10, z=0>
<x=5, y=5, z=10>
<x=2, y=-7, z=3>
<x=9, y=-8, z=-3>
`
      )
    ).toBe(4686774924);
  });

  it("p2", () => {
    const result = solveP2(input);
    expect(result).toBe(295693702908636);
  });
});
