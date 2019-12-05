import { splitIntoDigits } from ".";

describe("utils", () => {
  it("splits into digits", () => {
    expect(splitIntoDigits(0)).toEqual([0]);
    expect(splitIntoDigits(12345)).toEqual([1, 2, 3, 4, 5]);
  });
});
