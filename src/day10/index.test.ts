import { solveP1, solveP2 } from ".";
import fs from "fs";
import path from "path";

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

describe("day10", () => {
  it("p1 samples", () => {
    expect(
      solveP1(`
.#..#
.....
#####
....#
...##
`).max
    ).toBe(8);

    expect(
      solveP1(`
......#.#.
#..#.#....
..#######.
.#.#.###..
.#..#.....
..#....#.#
#..#....#.
.##.#..###
##...#..#.
.#....####`).max
    ).toBe(33);

    expect(
      solveP1(`
#.#...#.#.
.###....#.
.#....#...
##.#.#.#.#
....#.#.#.
.##..###.#
..#...##..
..##....##
......#...
.####.###.
`).max
    ).toBe(35);

    expect(
      solveP1(`
.#..#..###
####.###.#
....###.#.
..###.##.#
##.##.#.#.
....###..#
..#.#..#.#
#..#.#.###
.##...##.#
.....#.#..
`).max
    ).toBe(41);

    expect(
      solveP1(`
.#..##.###...#######
##.############..##.
.#.######.########.#
.###.#######.####.#.
#####.##.#.##.###.##
..#####..#.#########
####################
#.####....###.#.#.##
##.#################
#####.##.###..####..
..######..##.#######
####.##.####...##..#
.#####..#.######.###
##...#.##########...
#.##########.#######
.####.#.###.###.#.##
....##.##.###..#####
.#.#.###########.###
#.#.#.#####.####.###
###.##.####.##.#..##
`).max
    ).toBe(210);
  });

  it("p1", () => {
    const result = solveP1(input).max;
    expect(result).toBe(284);
  });

  it("p2 samples", () => {
    expect(
      solveP2(`
.#..##.###...#######
##.############..##.
.#.######.########.#
.###.#######.####.#.
#####.##.#.##.###.##
..#####..#.#########
####################
#.####....###.#.#.##
##.#################
#####.##.###..####..
..######..##.#######
####.##.####...##..#
.#####..#.######.###
##...#.##########...
#.##########.#######
.####.#.###.###.#.##
....##.##.###..#####
.#.#.###########.###
#.#.#.#####.####.###
###.##.####.##.#..##
`)
    ).toBe(802);
  });

  it("p2", () => {
    const result = solveP2(input);
    expect(result).toBe(404);
  });
});
