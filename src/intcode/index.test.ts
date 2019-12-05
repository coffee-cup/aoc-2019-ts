import { readOpcode, execute } from ".";

const executeM = (memory: number[]): number[] => execute(memory).memory;

describe("intcode", () => {
  it("reads an opcode and modes", () => {
    expect(readOpcode(1002)).toEqual({
      op: 2,
      modes: [0, 1, 0]
    });

    expect(readOpcode(3)).toEqual({
      op: 3,
      modes: [0, 0, 0]
    });

    expect(readOpcode(11101)).toEqual({
      op: 1,
      modes: [1, 1, 1]
    });
  });

  it("example programs", () => {
    expect(executeM([1, 0, 0, 0, 99])).toEqual([2, 0, 0, 0, 99]);
    expect(executeM([2, 3, 0, 3, 99])).toEqual([2, 3, 0, 6, 99]);
    expect(executeM([2, 4, 4, 5, 99, 0])).toEqual([2, 4, 4, 5, 99, 9801]);
    expect(executeM([1, 1, 1, 4, 99, 5, 6, 0, 99])).toEqual([
      30,
      1,
      1,
      4,
      2,
      5,
      6,
      0,
      99
    ]);
  });
});
