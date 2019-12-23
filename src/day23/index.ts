import * as fs from "fs";
import * as path from "path";
import _ from "lodash";
import { parseProgram, execute, Memory } from "../intcode";
import clear from "clear";

const input = fs.readFileSync(path.resolve(__dirname, "input.txt"), "utf8");

enum SendingStatus {
  Waiting = 0,
  X,
  Y
}

type Packet = number[];

interface Computer {
  id: number;
  booted: boolean;
  queue: number[];
  sendingStatus: SendingStatus;
  sendingTo: number | null;
  requestInput: any;
  receiveOutput: any;
  idle: boolean;
}

interface NAT {
  packet: Packet | null;
}

const computers: { [key: number]: Computer } = {};

const nat: NAT = {
  packet: null
};

const natPacketsSent: { [key: number]: boolean } = {};

const allIdle = (): boolean =>
  _.every(Object.values(computers).map(c => c.idle));

const checkIdle = () => {
  if (allIdle() && nat.packet != null) {
    if (nat.packet[0] == null || nat.packet[1] == null) {
      throw new Error("no");
    }

    if (natPacketsSent[nat.packet[1]]) {
      throw new Error(nat.packet[1].toString());
    }

    natPacketsSent[nat.packet[1]] = true;
    console.log("sending to 0", nat.packet);

    computers[0].queue.push(nat.packet[0]);
    computers[0].queue.push(nat.packet[1]);

    nat.packet = null;
  }
};

const createComputer = (id: number, computers: { [key: number]: Computer }) => {
  const computer: Computer = {
    id,
    booted: false,
    queue: [],
    sendingStatus: SendingStatus.Waiting,
    sendingTo: null,
    requestInput: null,
    receiveOutput: null,
    idle: false
  };

  let count = 0;

  const requestInput = async (): Promise<number> => {
    // console.log(_.max(Object.values(computers).map(c => c.queue.length)));

    if (!computer.booted) {
      computer.booted = true;
      return computer.id;
    }

    if (computer.queue.length === 0) {
      computer.idle = true;
      checkIdle();

      // count += 1;
      // if (count > 1000) {
      //   count = 0;
      //   const used = process.memoryUsage().heapUsed / 1024 / 1024;
      //   console.log(
      //     `The script uses approximately ${Math.round(used * 100) / 100} MB`
      //   );
      // }

      return -1;
    }

    computer.idle = false;
    const val = computer.queue.shift();

    return val;
  };

  const packet: Packet = [0, 0];

  const receiveOutput = (value: number) => {
    computer.idle = false;

    if (computer.sendingStatus === SendingStatus.Waiting) {
      computer.sendingStatus = SendingStatus.X;
      computer.sendingTo = value;
    } else if (computer.sendingStatus === SendingStatus.X) {
      packet[0] = value;

      computer.sendingStatus = SendingStatus.Y;
    } else if (computer.sendingStatus === SendingStatus.Y) {
      const c = computers[computer.sendingTo];

      packet[1] = value;

      if (c == null) {
        nat.packet = [...packet];
      } else {
        c.queue.push(packet[0]);
        c.queue.push(packet[1]);
      }

      computer.sendingTo = null;
      computer.sendingStatus = SendingStatus.Waiting;
    }
  };

  computer.requestInput = requestInput;
  computer.receiveOutput = receiveOutput;

  return computer;
};

export const solveP1 = async (input: string) => {
  const program = parseProgram(input);

  for (let i = 0; i < 50; i += 1) {
    const c = createComputer(i, computers);
    computers[i] = c;
  }

  await Promise.all(
    Object.values(computers).map(c => {
      return execute([...program], {
        requestInput: c.requestInput,
        receiveOutput: c.receiveOutput
      });
    })
  );
};

solveP1(input);
