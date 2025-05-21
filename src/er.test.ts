import { test, expect, describe } from "vitest";
import {
  DuplicatorStrategy,
  findDuplicatorStrategy,
  isPartialIso,
  makeSymmetricGraph,
} from "./er";

describe("makeSymmetric", () => {
  test("empty", () => {
    expect(makeSymmetricGraph({})).toEqual({});
  });

  test("simple", () => {
    expect(
      makeSymmetricGraph({
        a: new Set("bc"),
      }),
    ).toEqual({
      a: new Set("bc"),
      b: new Set("a"),
      c: new Set("a"),
    });
  });
});

describe("partialIso ", () => {
  test("with no moves is trivially true", () => {
    const g1 = makeSymmetricGraph({
      a: new Set(["b", "c"]),
    });

    const g2 = makeSymmetricGraph({});

    expect(isPartialIso(g1, g2, [])).toBe(true);
  });

  test("with a single moves is trivially true", () => {
    const g1 = makeSymmetricGraph({
      a: new Set(["b", "c"]),
    });

    const g2 = makeSymmetricGraph({
      1: new Set([2]),
    });

    expect(isPartialIso(g1, g2, [["a", 1]])).toBe(true);
  });

  test("partial isomorphism holds when order matches adjacency", () => {
    // a <-> b <-> c
    const g1 = makeSymmetricGraph({
      a: new Set(["b"]),
      b: new Set(["c"]),
    });

    // x <-> y <-> z
    const g2 = makeSymmetricGraph({
      x: new Set(["y"]),
      y: new Set(["z"]),
    });

    expect(
      isPartialIso(g1, g2, [
        ["a", "x"],
        ["b", "y"],
        ["c", "z"],
      ]),
    ).toBe(true);
  });

  test("partial isomorphism holds regardless of order of mapping elements", () => {
    // a <-> b <-> c
    const g1 = makeSymmetricGraph({
      a: new Set(["b"]),
      b: new Set(["c"]),
    });

    // x <-> y <-> z
    const g2 = makeSymmetricGraph({
      x: new Set(["y"]),
      y: new Set(["z"]),
    });

    // Same mapping as above test but different order
    expect(
      isPartialIso(g1, g2, [
        ["c", "z"],
        ["a", "x"],
        ["b", "y"],
      ]),
    ).toBe(true);
  });

  test("fails when adjacency relationship is broken", () => {
    // a <-> b <-> c (a </-> c)
    // x <-> y <-> z (a </-> c)
    const g1 = makeSymmetricGraph({
      a: new Set(["b"]),
      b: new Set(["c"]),
      c: new Set(),
    });

    // x <-> y <-> z (x <-> z)
    // a <-> b <-> c (a <-> c)
    const g2 = makeSymmetricGraph({
      x: new Set(["y", "z"]),
      y: new Set(["z"]),
      z: new Set(),
    });

    expect(
      isPartialIso(g1, g2, [
        ["a", "x"],
        ["b", "y"],
        ["c", "z"],
      ]),
    ).toBe(false);
  });

  test("succeeds with partial mapping of a larger graph", () => {
    // a <-> b <-> c <-> d
    const g1 = makeSymmetricGraph({
      a: new Set(["b"]),
      b: new Set(["c"]),
      c: new Set(["d"]),
    });

    // x <-> y <-> z <-> w
    const g2 = makeSymmetricGraph({
      x: new Set(["y"]),
      y: new Set(["z"]),
      z: new Set(["w"]),
    });

    // Only mapping part of the graph
    expect(
      isPartialIso(g1, g2, [
        ["a", "x"],
        ["c", "z"],
      ]),
    ).toBe(true);
  });

  test("fails when non-adjacent nodes map to adjacent nodes", () => {
    // a <-> b and c <-> d (separate components)
    // x <-> _ and z <-> _ (separate components)
    const g1 = makeSymmetricGraph({
      a: new Set(["b"]),
      c: new Set(["d"]),
    });

    // x <-> y <-> z (all connected)
    const g2 = makeSymmetricGraph({
      x: new Set(["y"]),
      y: new Set(["z"]),
    });

    expect(
      isPartialIso(g1, g2, [
        ["a", "x"],
        ["c", "z"],
      ]),
    ).toBe(true);
  });

  test("succeeds with different node names but same structure", () => {
    // Differently named nodes but same structure
    const g1 = makeSymmetricGraph({
      node1: new Set(["node2"]),
      node2: new Set(["node3"]),
    });

    const g2 = makeSymmetricGraph({
      alpha: new Set(["beta"]),
      beta: new Set(["gamma"]),
    });

    expect(
      isPartialIso(g1, g2, [
        ["node1", "alpha"],
        ["node2", "beta"],
        ["node3", "gamma"],
      ]),
    ).toBe(true);
  });

  test("homework", () => {
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

    expect(
      isPartialIso(g1, g2, [
        [3, "c"],
        [1, "e"],
      ]),
    ).toBe(false);
  });

  test("homework (flip)", () => {
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

    expect(
      isPartialIso(g2, g1, [
        ["c", 3],
        ["e", 1],
      ]),
    ).toBe(false);
  });
});

describe("er game ", () => {
  test("simple (1 turn)", () => {
    const g1 = makeSymmetricGraph({
      a: new Set(["b"]),
    });

    const g2 = makeSymmetricGraph({
      1: new Set(["2"]),
    });

    expect(findDuplicatorStrategy(1, g1, g2, [])).toEqual<DuplicatorStrategy>({
      a: "1",
      b: "1",
      "1": "a",
      "2": "a",
    });
  });

  test("simple (2 turns)", () => {
    const g1 = makeSymmetricGraph({
      a: new Set(["b"]),
    });

    const g2 = makeSymmetricGraph({
      1: new Set(["2"]),
    });

    expect(findDuplicatorStrategy(2, g1, g2, [])).toEqual<DuplicatorStrategy>({
      "1": [
        "a",
        {
          "2": "b",
          b: "2",
        },
      ],
      "2": [
        "a",
        {
          "1": "b",
          b: "1",
        },
      ],
      a: [
        "1",
        {
          "2": "b",
          b: "2",
        },
      ],
      b: [
        "1",
        {
          "2": "a",
          a: "2",
        },
      ],
    });
  });

  describe("homework graphs", () => {
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

    test("solve", () => {
      expect(findDuplicatorStrategy(2, g1, g2, [])).toMatchSnapshot();
    });

    test("show a 3-game cannot be beat by duplicatpr", () => {
      expect(findDuplicatorStrategy(3, g1, g2, [])).toBeUndefined();
    });

    test("show initialy strategy is wrong", () => {
      expect(findDuplicatorStrategy(1, g1, g2, [[3, "c"]])).toBeUndefined();
    });

    test("solve with fixed initial moves", () => {
      expect(findDuplicatorStrategy(1, g1, g2, [[1, "a"]])).toMatchSnapshot();
    });

    test("c->1", () => {
      expect(findDuplicatorStrategy(1, g1, g2, [[1, "c"]]))
        .toMatchInlineSnapshot(`
          {
            "2": "a",
            "3": "a",
            "4": "d",
            "5": "d",
            "a": "2",
            "b": "2",
            "d": "4",
            "e": "4",
          }
        `);
    });

    test("b->2", () => {
      expect(findDuplicatorStrategy(1, g1, g2, [[2, "b"]]))
        .toMatchInlineSnapshot(`
        {
          "1": "a",
          "3": "a",
          "4": "a",
          "5": "a",
          "a": "1",
          "c": "1",
          "d": "1",
          "e": "1",
        }
      `);
    });

    test("1->c", () => {
      expect(findDuplicatorStrategy(1, g1, g2, [["c", 1]]))
        .toMatchInlineSnapshot(`
          {
            "2": "a",
            "3": "a",
            "4": "a",
            "5": "a",
            "a": "2",
            "b": "2",
            "d": "2",
            "e": "2",
          }
        `);
    });

    test("4->d", () => {
      expect(findDuplicatorStrategy(1, g1, g2, [[4, "d"]]))
        .toMatchInlineSnapshot(`
          {
            "1": "c",
            "2": "b",
            "3": "b",
            "5": "b",
            "a": "1",
            "b": "2",
            "c": "1",
            "e": "2",
          }
        `);
    });
  });
});
