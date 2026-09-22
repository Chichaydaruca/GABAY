import type { GraphEdge, GraphNode, Location } from "@/db/schema";

export const M_PER_UNIT = 0.1; // plan space: 1000 x 640 units ≈ 100 m x 64 m
export const WALK_MPS = 1.15;

export type Step = {
  instruction: string;
  landmark: string;
  meters: number;
  nodeId: string;
  turn: "straight" | "left" | "right" | "start" | "arrive";
};

export type RouteResult = {
  path: string[];
  points: [number, number][];
  steps: Step[];
  totalM: number;
  etaMin: number;
};

function angleOf(a: GraphNode, b: GraphNode): number {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

export function dijkstra(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
  startId: string,
  endId: string,
): string[] | null {
  const adj = new Map<string, { to: string; w: number }[]>();
  const byId = new Map(graphNodes.map((n) => [n.id, n]));
  if (!byId.has(startId) || !byId.has(endId)) return null;

  for (const n of graphNodes) adj.set(n.id, []);
  for (const e of graphEdges) {
    adj.get(e.fromNode)?.push({ to: e.toNode, w: e.weight });
    adj.get(e.toNode)?.push({ to: e.fromNode, w: e.weight });
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const visited = new Set<string>();
  for (const n of graphNodes) dist.set(n.id, Infinity);
  dist.set(startId, 0);

  while (true) {
    let cur: string | null = null;
    let best = Infinity;
    for (const [id, d] of dist) {
      if (!visited.has(id) && d < best) {
        best = d;
        cur = id;
      }
    }
    if (cur === null) break;
    if (cur === endId) break;
    visited.add(cur);
    for (const edge of adj.get(cur) ?? []) {
      const nd = best + edge.w;
      if (nd < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, nd);
        prev.set(edge.to, cur);
      }
    }
  }

  if (!prev.has(endId) && startId !== endId) return null;
  const path = [endId];
  let cursor = endId;
  while (cursor !== startId) {
    const p = prev.get(cursor);
    if (!p) return null;
    path.unshift(p);
    cursor = p;
  }
  return path;
}

function landmarkNear(
  graphNodes: GraphNode[],
  nodeId: string,
  exclude?: string,
): string {
  const node = graphNodes.find((n) => n.id === nodeId);
  if (!node) return "";
  const others = graphNodes.filter((n) => n.id !== nodeId);
  let nearest = others[0];
  let best = Infinity;
  for (const n of others) {
    const d = Math.hypot(n.x - node.x, n.y - node.y);
    if (d < best && n.id !== exclude) {
      best = d;
      nearest = n;
    }
  }
  return nearest?.label ?? "";
}

export function buildRoute(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
  path: string[],
  destination: Location,
): RouteResult {
  const byId = new Map(graphNodes.map((n) => [n.id, n]));
  const weightOf = (a: string, b: string) => {
    const e = graphEdges.find(
      (x) =>
        (x.fromNode === a && x.toNode === b) ||
        (x.fromNode === b && x.toNode === a),
    );
    const na = byId.get(a);
    const nb = byId.get(b);
    return e?.weight ?? (na && nb ? Math.hypot(na.x - nb.x, na.y - nb.y) : 0);
  };

  const steps: Step[] = [];
  const points: [number, number][] = path.map((id) => {
    const n = byId.get(id)!;
    return [n.x, n.y];
  });

  let totalUnits = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalUnits += weightOf(path[i], path[i + 1]);
  }

  if (path.length >= 2) {
    const first = byId.get(path[0])!;
    const second = byId.get(path[1])!;
    const units = weightOf(path[0], path[1]);
    steps.push({
      instruction: `Head from ${first.label} toward ${second.label}`,
      landmark: landmarkNear(graphNodes, path[1], path[0]),
      meters: Math.max(1, Math.round(units * M_PER_UNIT)),
      nodeId: path[0],
      turn: "start",
    });

    for (let i = 1; i < path.length - 1; i++) {
      const prev = byId.get(path[i - 1])!;
      const cur = byId.get(path[i])!;
      const next = byId.get(path[i + 1])!;
      const delta = normalize(angleOf(cur, next) - angleOf(prev, cur));
      const units = weightOf(path[i], path[i + 1]);
      const meters = Math.max(1, Math.round(units * M_PER_UNIT));
      let turn: Step["turn"] = "straight";
      let verb = "Continue straight";
      if (delta >= 30 && delta < 150) {
        turn = "right";
        verb = "Turn right";
      } else if (delta <= -30 && delta > -150) {
        turn = "left";
        verb = "Turn left";
      } else if (Math.abs(delta) >= 150) {
        turn = "straight";
        verb = "Turn around and continue";
      }
      steps.push({
        instruction: `${verb} at ${cur.label} toward ${next.label}`,
        landmark: landmarkNear(graphNodes, path[i + 1], path[i]),
        meters,
        nodeId: path[i],
        turn,
      });
    }
  }

  const last = byId.get(path[path.length - 1])!;
  steps.push({
    instruction: `You have arrived — ${destination.name}`,
    landmark: `${destination.building} · ${destination.floor}`,
    meters: 0,
    nodeId: last.id,
    turn: "arrive",
  });

  const totalM = Math.round(totalUnits * M_PER_UNIT);
  return {
    path,
    points,
    steps,
    totalM,
    etaMin: Math.max(1, Math.round((totalM / WALK_MPS) / 60)),
  };
}

function normalize(deg: number): number {
  let d = deg;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

/** Resolve a start identifier: QR token, location code, or graph node id. */
export function resolveStartNode(
  start: string | undefined,
  graphNodes: GraphNode[],
  locationByCode: Map<string, Location>,
): string {
  if (!start) return "C";
  const raw = start.trim().toUpperCase();
  const loc = locationByCode.get(raw) ?? [...locationByCode.values()].find(
    (l) => l.qrToken.toUpperCase().endsWith(`:${raw}`),
  );
  if (loc?.nodeId && graphNodes.some((n) => n.id === loc.nodeId)) return loc.nodeId;
  if (graphNodes.some((n) => n.id === raw)) return raw;
  return "C";
}
