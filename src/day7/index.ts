import { execute, parseProgram } from "../intcode";
import { permute } from "../utils";

const runWithSequenceP1 = async (
  program: number[],
  sequence: number[]
): Promise<number> => {
  let lastOutput = 0;

  for (const phase of sequence) {
    const input = [phase, lastOutput];
    const result = await execute([...program], { input });
    lastOutput = result.output[0];
  }

  return lastOutput;
};

export const solveP1 = async (input: string): Promise<number> => {
  const program = parseProgram(input);

  const possiblePhases = [0, 1, 2, 3, 4];
  const phasePermutations = permute(possiblePhases);

  let max = 0;

  for (const sequence of phasePermutations) {
    const output = await runWithSequenceP1(program, sequence);
    if (output > max) {
      max = output;
    }
  }

  return max;
};

interface Amp {
  id: string;
  phase: number;
  buffer: number[];
  waiting: { fn: null | ((value: number) => void) };
  receiveOutput: (value: number) => void;
  requestInput: (value: number) => Promise<number>;
}

const createAmp = (id: string, phase: number): Amp => {
  const buffer: number[] = [];

  let waiting: { fn: null | ((value: number) => void) } = {
    fn: null
  };

  const amp: Amp = {
    id,
    phase,
    buffer,
    waiting,
    receiveOutput: (_value: number) => {},
    requestInput: index => {
      if (buffer.length > 0) {
        return Promise.resolve(buffer[0]);
      }

      return new Promise(resolve => {
        waiting.fn = resolve;
      });
    }
  };

  return amp;
};

const connectAmps = (amp1: Amp, amp2: Amp) => {
  amp1.receiveOutput = (value: number) => {
    if (amp2.waiting.fn) {
      amp2.waiting.fn(value);
      amp2.waiting.fn = null;
    } else {
      amp2.buffer.push(value);
    }
  };
};

const runWithSequenceP2 = async (
  program: number[],
  sequence: number[]
): Promise<number> => {
  const ampA = createAmp("A", sequence[0]);
  const ampB = createAmp("B", sequence[1]);
  const ampC = createAmp("C", sequence[2]);
  const ampD = createAmp("D", sequence[3]);
  const ampE = createAmp("E", sequence[4]);
  const amps = [ampA, ampB, ampC, ampD, ampE];

  connectAmps(ampA, ampB);
  connectAmps(ampB, ampC);
  connectAmps(ampC, ampD);
  connectAmps(ampD, ampE);
  connectAmps(ampE, ampA);

  const results = await Promise.all(
    amps.map(amp => {
      const input = amp.id === "A" ? [amp.phase, 0] : [amp.phase];

      return execute([...program], {
        input,
        requestInput: amp.requestInput,
        receiveOutput: amp.receiveOutput
      });
    })
  );

  const ampEOutput = results[results.length - 1].output;
  const r = ampEOutput[ampEOutput.length - 1];

  return r;
};

export const solveP2 = async (input: string) => {
  const program = parseProgram(input);

  const possiblePhases = [5, 6, 7, 8, 9];
  const phasePermutations = permute(possiblePhases);

  let max = 0;
  for (const seq of phasePermutations) {
    const output = await runWithSequenceP2(program, seq);
    if (output > max) {
      max = output;
    }
  }

  return max;
};
