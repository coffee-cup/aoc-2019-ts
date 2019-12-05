import { readOpcode } from ".";

describe("intcode", () => {
  it("reads an opcode and modes", () => {
    expect(readOpcode(1002)).toEqual({
      op: 2,
      modes: [0, 1, 0]
    });
  });
});
