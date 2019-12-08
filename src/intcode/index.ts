import _ from "lodash";
import { splitIntoDigits } from "../utils";

enum ParameterMode {
  Position = 0,
  Immediate
}

type Memory = number[];

export interface Result {
  memory: Memory;
  output: number[];
}

interface Program {
  pc: number;
  memory: Memory;
  input: number[];
  output: number[];
  currentInput: number;
  requestInput?: (index: number) => Promise<number>;
  receiveOutput?: (value: number) => void;
}

export interface ProgramOptions {
  input?: number[];
  requestInput?: (index: number) => Promise<number>;
  receiveOutput?: (value: number) => void;
}

type Instruction = (program: Program, modes: ParameterMode[]) => Promise<void>;

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

  if (digits.length === 1) {
    return {
      op: digits[0],
      modes: [0, 0, 0]
    };
  }

  const opDigits = digits.slice(digits.length - 2);
  const op = opDigits[1] + opDigits[0] * 10;

  let modes = digits.slice(0, digits.length - 2).reverse();
  modes = _.range(3).map(i => (i < modes.length ? modes[i] : 0));

  return { op, modes };
};

const add: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  const val1 = getValue(memory[pc + 1], modes[0], memory);
  const val2 = getValue(memory[pc + 2], modes[1], memory);
  const out = memory[pc + 3];

  memory[out] = val1 + val2;

  program.pc += 4;
};

const mul: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  const val1 = getValue(memory[pc + 1], modes[0], memory);
  const val2 = getValue(memory[pc + 2], modes[1], memory);
  const out = memory[pc + 3];

  memory[out] = val1 * val2;

  program.pc += 4;
};

const input: Instruction = async program => {
  const { memory, pc } = program;

  if (program.input.length === 0 && program.requestInput == null) {
    throw new Error("Cannot input without value");
  }

  let val = 0;
  if (program.input.length !== 0) {
    val = program.input[0];
    program.input = program.input.slice(1);
  } else {
    val = await program.requestInput(program.currentInput);
  }

  // console.log(`input ${program.currentInput}, ${val}`);

  const out = memory[pc + 1];
  memory[out] = val;
  program.currentInput += 1;

  program.pc += 2;
};

const output: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  const val = getValue(memory[pc + 1], modes[0], memory);

  program.output.push(val);

  if (program.receiveOutput) {
    program.receiveOutput(val);
  }

  program.pc += 2;
};

const jumpIfTrue: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  const val = getValue(memory[pc + 1], modes[0], memory);
  const setTo = getValue(memory[pc + 2], modes[1], memory);

  if (val !== 0) {
    program.pc = setTo;
  } else {
    program.pc += 3;
  }
};

const jumpIfFalse: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  const val = getValue(memory[pc + 1], modes[0], memory);
  const setTo = getValue(memory[pc + 2], modes[1], memory);

  if (val === 0) {
    program.pc = setTo;
  } else {
    program.pc += 3;
  }
};

const lessThan: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  const val1 = getValue(memory[pc + 1], modes[0], memory);
  const val2 = getValue(memory[pc + 2], modes[1], memory);
  const out = memory[pc + 3];

  if (val1 < val2) {
    memory[out] = 1;
  } else {
    memory[out] = 0;
  }

  program.pc += 4;
};

const equals: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  const val1 = getValue(memory[pc + 1], modes[0], memory);
  const val2 = getValue(memory[pc + 2], modes[1], memory);
  const out = memory[pc + 3];

  if (val1 === val2) {
    memory[out] = 1;
  } else {
    memory[out] = 0;
  }

  program.pc += 4;
};

const instructions: { [op: number]: Instruction } = {
  1: add,
  2: mul,
  3: input,
  4: output,
  5: jumpIfTrue,
  6: jumpIfFalse,
  7: lessThan,
  8: equals
};

const compute = async (program: Program): Promise<Memory> => {
  const { memory, pc } = program;
  const { op, modes } = readOpcode(program.memory[pc]);

  if (op === 99) {
    return memory;
  } else if (instructions[op] != null) {
    await instructions[op](program, modes);
  } else {
    throw new Error(`Opcode ${op} not recognized`);
  }

  return await compute(program);
};

export const execute = async (
  memory: number[],
  options: ProgramOptions = {}
): Promise<Result> => {
  const program: Program = {
    pc: 0,
    memory,
    currentInput: 0,
    input: options.input ?? [],
    requestInput: options.requestInput,
    receiveOutput: options.receiveOutput,
    output: []
  };

  await compute(program);

  return {
    memory: program.memory,
    output: program.output
  };
};

export const parseProgram = (input: string): number[] =>
  input
    .trim()
    .split(",")
    .map(n => parseInt(n, 10));
