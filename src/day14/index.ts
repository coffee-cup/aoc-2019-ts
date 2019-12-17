import _ from "lodash";

interface ChemicalQuantity {
  amount: number;
  name: string;
}

interface Reaction {
  name: string;
  amount: number;
  inputs: ChemicalQuantity[];
}

const parseChemicalQuantity = (s: string): ChemicalQuantity => {
  const [amount, name] = s.trim().split(" ");
  return { amount: parseInt(amount, 10), name };
};

const parseReaction = (line: string): Reaction => {
  const [iChems, oChems] = line.split("=>");
  const left = iChems.split(",").map(parseChemicalQuantity);
  const right = parseChemicalQuantity(oChems);
  return { inputs: left, name: right.name, amount: right.amount };
};

const parseInput = (input: string): { [key: string]: Reaction } => {
  const lines = input.trim().split("\n");
  return lines.reduce((acc, line) => {
    const r = parseReaction(line);
    return {
      ...acc,
      [r.name]: r
    };
  }, {});
};

// const findInputs = (
//   reactions: Reaction[],
//   name: string
// ): [ChemicalQuantity[], number] => {
//   const reaction = reactions.find(r => r.output.name === name);
//   const amountProduced = reaction.output.amount;
//   return [reaction.inputs, amountProduced];
// };

// const isFirstDegree = (reactions: Reaction[], name: string): boolean => {
//   const [inputs] = findInputs(reactions, name);
//   return inputs.length === 1 && inputs[0].name === "ORE";
// };

// const computeFirstLevel = (
//   reactions: Reaction[],
//   want: string,
//   amount: number,
//   level: number = 0
// ): { [key: string]: number } => {
//   console.log(`${_.repeat("  ", level)}WANT ${amount} of ${want}`);

//   const [inputs, amountProduced] = findInputs(reactions, want);
//   const requiredReactions = Math.ceil(amount / amountProduced);

//   if (isFirstDegree(reactions, want)) {
//     return {
//       [want]: amount
//     };
//   }

//   const firstLevel = {};
//   for (const chem of inputs) {
//     const computed = computeFirstLevel(
//       reactions,
//       chem.name,
//       chem.amount * requiredReactions,
//       level + 1
//     );

//     Object.keys(computed).forEach(key => {
//       if (!firstLevel[key]) {
//         firstLevel[key] = 0;
//       }

//       firstLevel[key] += computed[key];
//     });
//   }

//   return firstLevel;
// };

// const computeORE = (
//   reactions: Reaction[],
//   required: { [key: string]: number }
// ): number => {
//   let count = 0;

//   for (const name of Object.keys(required)) {
//     const amount = required[name];
//     const [inputs, amountProduced] = findInputs(reactions, name);
//     const requiredReactions = Math.ceil(amount / amountProduced);

//     count += inputs[0].amount * requiredReactions;
//   }

//   return count;
// };

const totals: { [key: string]: number } = {};

const computeORE = (
  reactions: { [key: string]: Reaction },
  want: string,
  amount: number,
  level: number = 0,
  extra: { [key: string]: number } = {}
) => {
  const chem = reactions[want];
  let needed = amount;

  totals[want] = (totals[want] || 0) + needed;

  // console.log(`\n${_.repeat("    ", level)}WANT ${needed} of ${want}`);

  if (want === "ORE") {
    return needed;
  }

  if (extra[want] > 0) {
    if (extra[want] > needed) {
      extra[want] -= needed;
      needed = 0;
    } else {
      needed -= extra[want];
      extra[want] = 0;
    }
  }

  const requiredReactions = Math.ceil(needed / chem.amount);
  const amountProduced = chem.amount * requiredReactions;

  // console.log({
  //   want,
  //   needed,
  //   chem: chem.amount,
  //   requiredReactions,
  //   amountProduced
  // });

  if (amountProduced > needed) {
    extra[want] = (extra[want] || 0) + (amountProduced - needed);
  }

  let count = 0;
  for (const input of chem.inputs) {
    count += computeORE(
      reactions,
      input.name,
      input.amount * requiredReactions,
      level + 1,
      extra
    );
  }

  return count;
};

export const solveP1 = (input: string) => {
  const reactions = parseInput(input);

  const count = computeORE(reactions, "FUEL", 1);

  return count;
};

export const solveP2 = (input: string) => {
  const reactions = parseInput(input);

  const oreStore = 1000000000000;

  let min = 10000;
  let max = oreStore;

  let fuelRequirement = 1000000;
  let inc = 100000;

  while (true) {
    const count = computeORE(reactions, "FUEL", fuelRequirement);

    if (count > oreStore) {
      max = fuelRequirement;
    } else {
      min = fuelRequirement;
    }

    if (Math.abs(max - min) <= 1) {
      break;
    }

    fuelRequirement = Math.round((max + min) / 2);
  }

  return min;
};

const input = `
171 ORE => 8 CNZTR
7 ZLQW, 3 BMBT, 9 XCVML, 26 XMNCP, 1 WPTQ, 2 MZWV, 1 RJRHP => 4 PLWSL
114 ORE => 4 BHXH
14 VRPVC => 6 BMBT
6 BHXH, 18 KTJDG, 12 WPTQ, 7 PLWSL, 31 FHTLT, 37 ZDVW => 1 FUEL
6 WPTQ, 2 BMBT, 8 ZLQW, 18 KTJDG, 1 XMNCP, 6 MZWV, 1 RJRHP => 6 FHTLT
15 XDBXC, 2 LTCX, 1 VRPVC => 6 ZLQW
13 WPTQ, 10 LTCX, 3 RJRHP, 14 XMNCP, 2 MZWV, 1 ZLQW => 1 ZDVW
5 BMBT => 4 WPTQ
189 ORE => 9 KTJDG
1 MZWV, 17 XDBXC, 3 XCVML => 2 XMNCP
12 VRPVC, 27 CNZTR => 2 XDBXC
15 KTJDG, 12 BHXH => 5 XCVML
3 BHXH, 2 VRPVC => 7 MZWV
121 ORE => 7 VRPVC
7 XCVML => 6 RJRHP
5 BHXH, 4 VRPVC => 5 LTCX
`;

// solveP2(input);
