import _ from "lodash";
import { splitIntoDigits } from "../utils";

enum ParameterMode {
  Position = 0,
  Immediate
}

type Memory = number[];

interface Output {
  pc: number;
  value: number;
}

interface ProgramOutput {
  memory: Memory;
  output: Output[];
}

interface Program {
  pc: number;
  memory: Memory;
  input?: number;
  output: Output[];
}

type Instruction = (program: Program, modes: ParameterMode[]) => void;

const getValue = (val: number, mode: ParameterMode, memory: Memory): number => {
  if (mode === ParameterMode.Position) {
    return memory[val];
  } else if (mode === ParameterMode.Immediate) {
    return val;
  }
};

export const readOpcode = (
  opcode: number
): {
  op: number;
  modes: ParameterMode[];
} => {
  const digits = splitIntoDigits(opcode);

  const opDigits = digits.slice(digits.length - 2);
  const op = opDigits[1] + opDigits[0] * 10;

  let modes = digits.slice(0, digits.length - 2).reverse();
  modes = _.range(3).map(i => (i < modes.length ? modes[i] : 0));

  return { op, modes };
};

const add: Instruction = (program, modes) => {
  const { memory, pc } = program;

  const val1 = getValue(memory[pc + 1], modes[0], memory);
  const val2 = getValue(memory[pc + 2], modes[1], memory);
  const out = getValue(memory[pc + 3], modes[2], memory);

  memory[out] = val1 + val2;
  program.pc += 4;
};

const mul: Instruction = (program, modes) => {
  const { memory, pc } = program;

  const val1 = getValue(memory[pc + 1], modes[0], memory);
  const val2 = getValue(memory[pc + 2], modes[1], memory);
  const out = getValue(memory[pc + 3], modes[2], memory);

  memory[out] = val1 * val2;

  program.pc += 4;
};

const input: Instruction = program => {
  const { memory, pc } = program;

  const out = memory[pc + 1];
  memory[out] = program.input;

  program.pc += 2;
};

const output: Instruction = (program, modes) => {
  const { memory, pc, output } = program;

  const val = getValue(memory[pc + 1], modes[0], memory);

  const newOutput: Output = {
    pc: program.pc,
    value: val
  };
};

const instructions: { [op: number]: Instruction } = {
  1: add,
  2: mul,
  3: input,
  4: output
};

const compute = (program: Program): Memory => {
  const { memory, pc } = program;
  const { op, modes } = readOpcode(program.memory[pc]);

  if (op === 99) {
    return memory;
  } else if (instructions[op] != null) {
    instructions[op](program, modes);
  } else {
    throw new Error(`Opcode ${op} no recognized`);
  }

  return compute(program);
};

export const execute = (memory: number[], input?: number): ProgramOutput => {
  const program: Program = {
    pc: 0,
    memory,
    input,
    output: []
  };

  compute(program);

  return {
    memory: program.memory,
    output: program.output
  };
};
