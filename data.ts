import { db } from "@/db";
import {
  announcements,
  edges,
  locations,
  nodes,
  scans,
  type Announcement,
  type GraphEdge,
  type GraphNode,
  type Location,
} from "@/db/schema";
import { asc, count, eq } from "drizzle-orm";

/* ------------------------------------------------------------------ *
 * Seed data — GABAY pilot, Main Building ground floor.
 * Plan coordinate space: 1000 x 640 units, 1 unit = 0.1 m.
 * ------------------------------------------------------------------ */

export const SEED_NODES: GraphNode[] = [
  { id: "W1", label: "West Corridor", x: 70, y: 320 },
  { id: "A", label: "West Junction", x: 300, y: 320 },
  { id: "C", label: "Main Lobby", x: 500, y: 320 },
  { id: "B", label: "East Junction", x: 720, y: 320 },
  { id: "E", label: "East Corridor", x: 930, y: 320 },
  { id: "N", label: "North Wing", x: 500, y: 110 },
  { id: "NW", label: "North-West Wing", x: 300, y: 110 },
  { id: "NE", label: "North-East Wing", x: 720, y: 110 },
  { id: "S", label: "South Wing", x: 500, y: 540 },
  { id: "SW", label: "South-West Wing", x: 300, y: 540 },
  { id: "SE", label: "South-East Wing", x: 720, y: 540 },
];

const link = (fromNode: string, toNode: string): GraphEdge => {
  const a = SEED_NODES.find((n) => n.id === fromNode)!;
  const b = SEED_NODES.find((n) => n.id === toNode)!;
  const w = Math.round(Math.hypot(a.x - b.x, a.y - b.y));
  return { id: 0, fromNode, toNode, weight: w };
};

export const SEED_EDGES: GraphEdge[] = [
  link("W1", "A"),
  link("A", "C"),
  link("C", "B"),
  link("B", "E"),
  link("C", "N"),
  link("A", "NW"),
  link("B", "NE"),
  link("C", "S"),
  link("A", "SW"),
  link("B", "SE"),
];

type SeedLocation = Omit<Location, "id">;

export const SEED_LOCATIONS: SeedLocation[] = [
  {
    code: "R104",
    name: "Room 104",
    category: "Classroom",
    building: "Main Building",
    floor: "Ground Floor",
    description:
      "Regular classroom for College of Engineering classes. Seats 40 with a projector.",
    hours: "Mon–Fri, 7:00–20:00",
    tags: "classroom class engineering room lecture silid klase",
    qrToken: "GABAY:R104",
    nodeId: "A",
    mapX: 90,
    mapY: 210,
    mapW: 180,
    mapH: 70,
  },
  {
    code: "R105",
    name: "Room 105",
    category: "Classroom",
    building: "Main Building",
    floor: "Ground Floor",
    description:
      "Classroom behind the West Junction, used for morning lectures and quizzes.",
    hours: "Mon–Fri, 7:00–20:00",
    tags: "classroom class room quiz lecture silid klase",
    qrToken: "GABAY:R105",
    nodeId: "A",
    mapX: 90,
    mapY: 360,
    mapW: 180,
    mapH: 70,
  },
  {
    code: "ITRM",
    name: "IT Room",
    category: "Computer Laboratory",
    building: "Main Building",
    floor: "Ground Floor",
    description:
      "Computer laboratory with 36 workstations and a live Wi-Fi 6 access point.",
    hours: "Mon–Sat, 7:00–19:00",
    tags: "it computer laboratory comlab wifi wifi6 printer computer lab",
    qrToken: "GABAY:ITRM",
    nodeId: "C",
    mapX: 330,
    mapY: 210,
    mapW: 140,
    mapH: 70,
  },
  {
    code: "R128",
    name: "Room 128",
    category: "Classroom",
    building: "Main Building",
    floor: "Ground Floor",
    description:
      "Large classroom beside the Main Lobby. Used as the Rizal Hall extension during exam week.",
    hours: "Mon–Fri, 7:00–20:00",
    tags: "classroom class room rizal exam lecture silid klase",
    qrToken: "GABAY:R128",
    nodeId: "C",
    mapX: 530,
    mapY: 360,
    mapW: 170,
    mapH: 70,
  },
  {
    code: "REG",
    name: "Registrar's Office",
    category: "Office",
    building: "Main Building",
    floor: "Ground Floor",
    description:
      "Certificates, enrollment and Transcript of Records. Take a number at the kiosk outside the door.",
    hours: "Mon–Fri, 8:00–17:00 (break 12:00–13:00)",
    tags: "registrar records enrollment transcript certificate queue tor office",
    qrToken: "GABAY:REG",
    nodeId: "C",
    mapX: 530,
    mapY: 210,
    mapW: 170,
    mapH: 70,
  },
  {
    code: "LIB",
    name: "Library",
    category: "Facility",
    building: "Main Building",
    floor: "Ground Floor",
    description:
      "Circulation counter, periodicals and a silent study area. Library card required at the entrance.",
    hours: "Mon–Sat, 7:30–19:30",
    tags: "library books study periodicals wifi silent aklatan libro",
    qrToken: "GABAY:LIB",
    nodeId: "B",
    mapX: 740,
    mapY: 210,
    mapW: 170,
    mapH: 70,
  },
  {
    code: "CLIN",
    name: "Campus Clinic",
    category: "Service",
    building: "Main Building",
    floor: "Ground Floor",
    description:
      "First aid, medical and dental consultation. A nurse is on duty during office hours.",
    hours: "Mon–Fri, 8:00–17:00",
    tags: "clinic nurse medical doctor sick first aid dental infirmary",
    qrToken: "GABAY:CLIN",
    nodeId: "B",
    mapX: 740,
    mapY: 360,
    mapW: 170,
    mapH: 70,
  },
  {
    code: "GUID",
    name: "Guidance Center",
    category: "Office",
    building: "Main Building",
    floor: "Ground Floor",
    description:
      "Counseling, career and personal support for students. Walk-in and by-schedule.",
    hours: "Mon–Fri, 8:00–17:00",
    tags: "guidance counseling psychologist career schedule help",
    qrToken: "GABAY:GUID",
    nodeId: "C",
    mapX: 330,
    mapY: 360,
    mapW: 140,
    mapH: 70,
  },
  {
    code: "ADMIN",
    name: "Administrative Office",
    category: "Office",
    building: "Science Wing",
    floor: "Ground Floor",
    description:
      "Office of the Dean and the administrative staff. Document lodgments are accepted at the counter.",
    hours: "Mon–Fri, 8:00–17:00",
    tags: "admin dean office records documents staff dean office",
    qrToken: "GABAY:ADMIN",
    nodeId: "N",
    mapX: 410,
    mapY: 20,
    mapW: 140,
    mapH: 55,
  },
  {
    code: "PHYLAB",
    name: "Physics Laboratory",
    category: "Laboratory",
    building: "Science Wing",
    floor: "Ground Floor",
    description:
      "Laboratory for Physics and General Science. Food and drinks are not allowed inside.",
    hours: "Mon–Sat, 7:00–17:00",
    tags: "physics laboratory science experiment lab laboratoryo",
    qrToken: "GABAY:PHYLAB",
    nodeId: "NW",
    mapX: 200,
    mapY: 20,
    mapW: 180,
    mapH: 55,
  },
  {
    code: "FAC",
    name: "Faculty Room",
    category: "Office",
    building: "Science Wing",
    floor: "Ground Floor",
    description:
      "Faculty consultation and instructor desks. Check the schedule posted on the door before knocking.",
    hours: "Mon–Fri, 7:00–18:00",
    tags: "faculty teacher consultation schedule professor guro instructor",
    qrToken: "GABAY:FAC",
    nodeId: "NE",
    mapX: 620,
    mapY: 20,
    mapW: 180,
    mapH: 55,
  },
  {
    code: "CAF",
    name: "Canteen",
    category: "Food",
    building: "Annex",
    floor: "Ground Floor",
    description:
      "Cafeteria and stall-style meals. A water refill station is on the right side.",
    hours: "Mon–Sat, 6:30–19:00",
    tags: "canteen cafeteria food eat water refill meals murang pagkain",
    qrToken: "GABAY:CAF",
    nodeId: "S",
    mapX: 380,
    mapY: 470,
    mapW: 180,
    mapH: 55,
  },
  {
    code: "CR",
    name: "Restroom (CR)",
    category: "Service",
    building: "Annex",
    floor: "Ground Floor",
    description:
      "Clean restroom beside the South Wing. An access ramp is on the right side.",
    hours: "Daily, 6:00–21:00",
    tags: "cr restroom toilet bathroom comfort room banyo palikuran",
    qrToken: "GABAY:CR",
    nodeId: "S",
    mapX: 580,
    mapY: 470,
    mapW: 60,
    mapH: 55,
  },
  {
    code: "AUD",
    name: "Auditorium",
    category: "Venue",
    building: "Annex",
    floor: "Ground Floor",
    description:
      "350 seats for assemblies, orientations and performances. Green room at the back.",
    hours: "Daily, 7:00–21:00",
    tags: "auditorium assembly orientation program seats performance tanghalan",
    qrToken: "GABAY:AUD",
    nodeId: "SW",
    mapX: 140,
    mapY: 555,
    mapW: 220,
    mapH: 60,
  },
  {
    code: "GYM",
    name: "Gymnasium",
    category: "Venue",
    building: "Annex",
    floor: "Ground Floor",
    description:
      "Covered court for PE classes, intramurals and graduation rites. Male and female CR inside.",
    hours: "Daily, 6:00–21:00",
    tags: "gym gymnasium court pe intramurals sports basketball cr",
    qrToken: "GABAY:GYM",
    nodeId: "SE",
    mapX: 620,
    mapY: 555,
    mapW: 260,
    mapH: 60,
  },
];

export const SEED_ANNOUNCEMENTS: Pick<
  Announcement,
  "title" | "body" | "tag" | "createdAt"
>[] = [
  {
    title: "Long Examination Week — West Hallway Open Until 20:00",
    body: "Monday to Friday, the West Corridor stays open until 20:00. Bring a valid ID when entering.",
    tag: "Academics",
    createdAt: new Date("2026-02-10T08:00:00Z"),
  },
  {
    title: "Slow Wi-Fi in the Science Wing",
    body: "Fiber maintenance is ongoing in the North Wing until Friday. Use the SSID GABAY-GUEST while in the Main Building.",
    tag: "Facilities",
    createdAt: new Date("2026-02-09T13:30:00Z"),
  },
  {
    title: "New Registrar Queue: Kiosk First, QR After",
    body: "Take a number at the kiosk outside the Registrar, then scan the QR plate at the door with GABAY to start navigation.",
    tag: "Services",
    createdAt: new Date("2026-02-07T09:15:00Z"),
  },
];

/* ------------------------------------------------------------------ *
 * Reads with graceful fallback — the app still runs with no database
 * ------------------------------------------------------------------ */

let seeded = false;

export async function ensureSeed(): Promise<void> {
  if (seeded) return;
  try {
    const [{ total }] = await db.select({ total: count() }).from(locations);
    if (total === 0) {
      await db.insert(locations).values(SEED_LOCATIONS as Location[]);
      await db.insert(nodes).values(SEED_NODES);
      await db.insert(edges).values(
        SEED_EDGES.map(({ fromNode, toNode, weight }) => ({
          fromNode,
          toNode,
          weight,
        })),
      );
      await db.insert(announcements).values(SEED_ANNOUNCEMENTS);
    }
    seeded = true;
  } catch (err) {
    console.warn("[gabay] ensureSeed skipped:", (err as Error).message);
  }
}

export async function getLocations(): Promise<Location[]> {
  await ensureSeed();
  try {
    const rows = await db.select().from(locations).orderBy(asc(locations.code));
    if (rows.length) return rows;
  } catch (err) {
    console.warn("[gabay] locations fallback:", (err as Error).message);
  }
  return SEED_LOCATIONS.map((l, i) => ({ ...l, id: i + 1 }));
}

export async function getLocation(code: string) {
  const all = await getLocations();
  const key = code.trim().toUpperCase();
  return (
    all.find((l) => l.code === key) ??
    all.find((l) => l.name.toUpperCase() === key) ??
    all.find((l) => l.qrToken.toUpperCase() === key) ??
    all.find((l) => l.qrToken.toUpperCase().endsWith(`:${key}`)) ??
    null
  );
}

export async function getGraph(): Promise<{
  nodes: GraphNode[];
  edges: GraphEdge[];
}> {
  await ensureSeed();
  try {
    const n = await db.select().from(nodes);
    const e = await db.select().from(edges);
    if (n.length && e.length) return { nodes: n, edges: e };
  } catch (err) {
    console.warn("[gabay] graph fallback:", (err as Error).message);
  }
  return { nodes: SEED_NODES, edges: SEED_EDGES };
}

export async function getAnnouncements(): Promise<Announcement[]> {
  await ensureSeed();
  try {
    const rows = await db
      .select()
      .from(announcements)
      .orderBy(asc(announcements.id));
    if (rows.length) return rows.reverse();
  } catch (err) {
    console.warn("[gabay] announcements fallback:", (err as Error).message);
  }
  return SEED_ANNOUNCEMENTS.map((a, i) => ({ ...a, id: i + 1 }));
}

export async function logScan(
  token: string,
  locationId: number | null,
  source: string,
): Promise<void> {
  try {
    await ensureSeed();
    await db.insert(scans).values({ token, locationId, source });
  } catch (err) {
    console.warn("[gabay] scan log failed:", (err as Error).message);
  }
}

export async function getScanCount(): Promise<number> {
  try {
    const [{ total }] = await db.select({ total: count() }).from(scans);
    return total;
  } catch {
    return 0;
  }
}

export async function getLocationsByIds(codes: string[]) {
  const all = await getLocations();
  return codes
    .map((c) => all.find((l) => l.code === c))
    .filter((l): l is Location => Boolean(l));
}

export function isLocation(row: unknown): row is Location {
  return Boolean(row && typeof row === "object" && "code" in row);
}

export const eqCode = eq;
