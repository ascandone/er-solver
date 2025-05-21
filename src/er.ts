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
  for (const [g1Key_x, g2Key_x] of moves) {
    for (const [g1Key_y, g2Key_y] of moves) {
      if (g1Key_x === g1Key_y) {
        continue;
      }

      const sameEdge =
        getEdges(g1, g1Key_x).has(String(g1Key_y)) ===
        getEdges(g2, g2Key_x).has(String(g2Key_y));

      if (!sameEdge) {
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
