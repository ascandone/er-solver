export type ID = string | number;

export type Graph = Record<ID, Set<ID>>;

// Utils

function getEdges(/* &mut */ g: Graph, from: ID): Set<ID> {
  const adjs = g[from];
  if (adjs === undefined) {
    const adjs = new Set<ID>();
    g[from] = adjs;
    return adjs;
  }
  return adjs;
}

function addEdge(/* &mut */ g: Graph, from: ID, to: ID) {
  getEdges(g, from).add(to);
}

export function makeSymmetricGraph(g: Graph): Graph {
  const symG: Graph = {};
  for (const [id, adjs] of Object.entries(g)) {
    for (const adj of adjs) {
      getEdges(symG, id).add(adj);
      getEdges(symG, adj).add(id);
    }
  }
  return symG;
}

export function isPartialIso(g1: Graph, g2: Graph, moves: [ID, ID][]): boolean {
  return (
    isPartialIsoOneSide(g1, g2, moves) &&
    isPartialIsoOneSide(
      g2,
      g1,
      moves.map(([l, r]) => [r, l]),
    )
  );
}

function isPartialIsoOneSide(g1: Graph, g2: Graph, moves: [ID, ID][]): boolean {
  // g1->g2 mappings
  const g1ToG2Mappings = Object.fromEntries(moves);

  // g1's keys
  const mappedG2: Graph = {};

  for (const [g1K, g1Adjs] of Object.entries(g1)) {
    const g1K__mapped = g1ToG2Mappings[g1K];
    if (g1K__mapped === undefined) {
      continue;
    }

    for (const g1Adj of g1Adjs) {
      const g1Adj__mapped = g1ToG2Mappings[g1Adj];
      if (g1Adj__mapped === undefined) {
        continue;
      }

      addEdge(mappedG2, g1K__mapped, g1Adj__mapped);
    }
  }

  // compare graphs
  for (const [mappedG2K, mappedG2Adjs] of Object.entries(mappedG2)) {
    const originalAdjs = getEdges(g2, mappedG2K);

    for (const mappedAdj of mappedG2Adjs) {
      const has = originalAdjs.has(String(mappedAdj));
      if (!has) {
        return false;
      }
    }
  }

  return true;
}

export type DuplicatorStrategy = Record<ID, [ID, DuplicatorStrategy] | ID>;

function wasPicked(moves: [ID, ID][], id: ID) {
  return moves.some(
    ([l, r]) => String(l) === String(id) || String(r) === String(id),
  );
}

function findDuplicatorStrategyHelper(
  /*&mut*/ strategy: DuplicatorStrategy,

  k: number,
  g1: Graph,
  g2: Graph,
  moves: [ID, ID][],
) {
  for (const spoilerKey of Object.keys(g1)) {
    let hasStrategy = false;
    if (wasPicked(moves, spoilerKey)) {
      continue;
    }

    for (const duplicatorKey of Object.keys(g2)) {
      if (spoilerKey === duplicatorKey || wasPicked(moves, duplicatorKey)) {
        continue;
      }
      const newMoves: [ID, ID][] = [...moves, [spoilerKey, duplicatorKey]];
      // would picking this key win this turn?
      const iso = isPartialIso(g1, g2, newMoves);

      // if not, do not chose this path
      if (!iso) {
        continue;
      }

      // if it does, we must be sure it wins for the rest of the k-game
      const rec = findDuplicatorStrategy(k - 1, g1, g2, newMoves);
      if (rec === undefined) {
        // this path would make us fail later on
        continue;
      }

      hasStrategy = true;

      if (Object.keys(rec).length === 0) {
        strategy[spoilerKey] = duplicatorKey;
      } else {
        strategy[spoilerKey] = [duplicatorKey, rec];
      }
      break;
    }

    if (!hasStrategy) {
      return false;
    }
  }

  return true;
}

/** Find the strategy in a k-length game  */
export function findDuplicatorStrategy(
  k: number,
  g1: Graph,
  g2: Graph,
  moves: [ID, ID][] = [],
): DuplicatorStrategy | undefined {
  const strategy: DuplicatorStrategy = {};
  if (k === 0) {
    return strategy;
  }

  const hasStrategy = findDuplicatorStrategyHelper(strategy, k, g1, g2, moves);
  if (!hasStrategy) {
    return undefined;
  }

  const hasStrategy1 = findDuplicatorStrategyHelper(
    strategy,
    k,
    g2,
    g1,
    moves.map(([l, r]) => [r, l]),
  );
  if (!hasStrategy1) {
    return undefined;
  }

  return strategy;
}
