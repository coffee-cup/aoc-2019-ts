import _ from "lodash";
import { splitIntoDigits } from "../utils";

enum ParameterMode {
  Position = 0,
  Immediate,
  Relative
}

export type Memory = number[];

export interface Result {
  memory: Memory;
  output: number[];
}

interface Program {
  pc: number;
  memory: Memory;
  input: number[];
  output: number[];
  relativeBase: number;
  currentInputIndex: number;
  requestInput?: (index: number) => Promise<number | null>;
  receiveOutput?: (value: number) => void;
  shouldQuit: boolean;
}

export interface ProgramOptions {
  input?: number[];
  requestInput?: (index: number) => Promise<number | null>;
  receiveOutput?: (value: number) => void;
}

type Instruction = (program: Program, modes: ParameterMode[]) => Promise<void>;

const getValue = (
  val: number,
  mode: ParameterMode,
  { memory, relativeBase }: Program
): number => {
  if (mode === ParameterMode.Position) {
    return memory[val];
  } else if (mode === ParameterMode.Immediate) {
    return val;
  } else if (mode === ParameterMode.Relative) {
    return memory[relativeBase + val];
  } else {
    throw new Error(`Unknown input mode: ${mode}`);
  }
};

const writeValue = (
  pos: number,
  val: number,
  mode: ParameterMode,
  { memory, relativeBase }: Program
) => {
  if (mode === ParameterMode.Position) {
    memory[pos] = val;
  } else if (mode === ParameterMode.Relative) {
    memory[relativeBase + pos] = val;
  } else {
    throw new Error(`Unknown output mode: ${mode}`);
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

  const val1 = getValue(memory[pc + 1], modes[0], program);
  const val2 = getValue(memory[pc + 2], modes[1], program);

  writeValue(memory[pc + 3], val1 + val2, modes[2], program);

  program.pc += 4;
};

const mul: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  const val1 = getValue(memory[pc + 1], modes[0], program);
  const val2 = getValue(memory[pc + 2], modes[1], program);
  writeValue(memory[pc + 3], val1 * val2, modes[2], program);

  program.pc += 4;
};

const input: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  if (program.input.length === 0 && program.requestInput == null) {
    throw new Error("Cannot input without value");
  }

  let val = 0;
  if (program.input.length !== 0) {
    val = program.input[0];
    program.input = program.input.slice(1);
  } else {
    val = await program.requestInput(program.currentInputIndex);

    if (val == null) {
      program.shouldQuit = true;
    }
  }

  writeValue(memory[pc + 1], val, modes[0], program);
  program.currentInputIndex += 1;

  program.pc += 2;
};

const output: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  const val = getValue(memory[pc + 1], modes[0], program);

  if (program.receiveOutput) {
    program.receiveOutput(val);
  }

  program.output.push(val);
  program.pc += 2;
};

const jumpIfTrue: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  const val = getValue(memory[pc + 1], modes[0], program);
  const setTo = getValue(memory[pc + 2], modes[1], program);

  if (val !== 0) {
    program.pc = setTo;
  } else {
    program.pc += 3;
  }
};

const jumpIfFalse: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  const val = getValue(memory[pc + 1], modes[0], program);
  const setTo = getValue(memory[pc + 2], modes[1], program);

  if (val === 0) {
    program.pc = setTo;
  } else {
    program.pc += 3;
  }
};

const lessThan: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  const val1 = getValue(memory[pc + 1], modes[0], program);
  const val2 = getValue(memory[pc + 2], modes[1], program);

  if (val1 < val2) {
    writeValue(memory[pc + 3], 1, modes[2], program);
  } else {
    writeValue(memory[pc + 3], 0, modes[2], program);
  }

  program.pc += 4;
};

const equals: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  const val1 = getValue(memory[pc + 1], modes[0], program);
  const val2 = getValue(memory[pc + 2], modes[1], program);

  if (val1 === val2) {
    writeValue(memory[pc + 3], 1, modes[2], program);
  } else {
    writeValue(memory[pc + 3], 0, modes[2], program);
  }

  program.pc += 4;
};

const adjustRelativeBase: Instruction = async (program, modes) => {
  const { memory, pc } = program;

  const adjustment = getValue(memory[pc + 1], modes[0], program);
  program.relativeBase += adjustment;

  program.pc += 2;
};

const instructions: { [op: number]: Instruction } = {
  1: add,
  2: mul,
  3: input,
  4: output,
  5: jumpIfTrue,
  6: jumpIfFalse,
  7: lessThan,
  8: equals,
  9: adjustRelativeBase
};

const instructionNames = {
  1: "ADD",
  2: "MUL",
  3: "INPUT",
  4: "OUTPUT",
  5: "JUMP IF TRUE",
  6: "JUMP IF FALSE",
  7: "LESS THAN",
  8: "EQUALS",
  9: "ADJUST BASE"
};

const compute = async (program: Program): Promise<Memory> => {
  while (true) {
    const { memory, pc } = program;
    const { op, modes } = readOpcode(program.memory[pc]);

    if (op === 99 || program.shouldQuit) {
      return memory;
    } else if (instructions[op] != null) {
      await instructions[op](program, modes);
    } else {
      throw new Error(`Opcode ${op} not recognized`);
    }
  }
  // console.log({
  //   pc,
  //   op: instructionNames[op],
  //   modes,
  //   ra: program.relativeBase
  // });

  // await new Promise(r => setTimeout(r, 500));

  // return await compute(program);
};

export const execute = async (
  memory: number[],
  options: ProgramOptions = {}
): Promise<Result> => {
  const program: Program = {
    pc: 0,
    memory: [...memory, ...new Array(10000).fill(0)],
    currentInputIndex: 0,
    input: options.input ?? [],
    relativeBase: 0,
    requestInput: options.requestInput,
    receiveOutput: options.receiveOutput,
    output: [],
    shouldQuit: false
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
