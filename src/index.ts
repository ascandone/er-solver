import { findDuplicatorStrategy, makeSymmetricGraph } from "./er";

const g1 = makeSymmetricGraph({
  1: new Set(["2", "3"]),
  2: new Set(["3", "4", "5"]),
  3: new Set(["4", "5"]),
  4: new Set(["5"]),
});

const g2 = makeSymmetricGraph({
  a: new Set(["b", "c"]),
  b: new Set(["c", "d", "e"]),
  c: new Set([]),
  d: new Set(["e"]),
});

const solution = findDuplicatorStrategy(2, g1, g2, []);
console.log(JSON.stringify(solution, null, 2));
