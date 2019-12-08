import { readOpcode, execute } from ".";

const executeM = async (
  memory: number[],
  input: number[] = []
): Promise<number[]> => (await execute(memory, { input })).memory;

const getOutput = async (
  memory: number[],
  input: number[] = []
): Promise<number> => (await execute(memory, { input })).output[0];

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

  it("example programs", async () => {
    // samples from day 2
    expect(await executeM([1, 0, 0, 0, 99])).toEqual([2, 0, 0, 0, 99]);
    expect(await executeM([2, 3, 0, 3, 99])).toEqual([2, 3, 0, 6, 99]);
    expect(await executeM([2, 4, 4, 5, 99, 0])).toEqual([2, 4, 4, 5, 99, 9801]);
    expect(await executeM([1, 1, 1, 4, 99, 5, 6, 0, 99])).toEqual([
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

    // samples from day 5
    expect(await getOutput([3, 9, 8, 9, 10, 9, 4, 9, 99, -1, 8], [8])).toBe(1);
    expect(await getOutput([3, 9, 8, 9, 10, 9, 4, 9, 99, -1, 8], [1])).toBe(0);

    expect(await getOutput([3, 9, 7, 9, 10, 9, 4, 9, 99, -1, 8], [6])).toBe(1);
    expect(await getOutput([3, 9, 7, 9, 10, 9, 4, 9, 99, -1, 8], [9])).toBe(0);

    expect(await getOutput([3, 3, 1108, -1, 8, 3, 4, 3, 99], [8])).toBe(1);
    expect(await getOutput([3, 3, 1108, -1, 8, 3, 4, 3, 99], [1])).toBe(0);

    expect(await getOutput([3, 3, 1107, -1, 8, 3, 4, 3, 99], [5])).toBe(1);
    expect(await getOutput([3, 3, 1107, -1, 8, 3, 4, 3, 99], [9])).toBe(0);

    expect(
      await getOutput(
        [3, 12, 6, 12, 15, 1, 13, 14, 13, 4, 13, 99, -1, 0, 1, 9],
        [0]
      )
    ).toBe(0);
    expect(
      await getOutput(
        [3, 12, 6, 12, 15, 1, 13, 14, 13, 4, 13, 99, -1, 0, 1, 9],
        [1]
      )
    ).toBe(1);

    expect(
      await getOutput([3, 3, 1105, -1, 9, 1101, 0, 0, 12, 4, 12, 99, 1], [0])
    ).toBe(0);
    expect(
      await getOutput([3, 3, 1105, -1, 9, 1101, 0, 0, 12, 4, 12, 99, 1], [1])
    ).toBe(1);

    expect(
      await getOutput(
        JSON.parse(
          "[3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99]"
        ),
        [1]
      )
    ).toBe(999);

    expect(
      await getOutput(
        JSON.parse(
          "[3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99]"
        ),
        [8]
      )
    ).toBe(1000);

    expect(
      await getOutput(
        JSON.parse(
          "[3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99]"
        ),
        [10]
      )
    ).toBe(1001);
  });
});
