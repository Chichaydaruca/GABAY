"use client";

import type { Location } from "@/db/schema";

type Props = {
  locations: Location[];
  route?: [number, number][] | null;
  selected?: string | null;
  startNode?: string | null;
  onSelect?: (code: string) => void;
  compact?: boolean;
  dark?: boolean;
  className?: string;
};

export const NODE_POINTS: Record<string, [number, number]> = {
  W1: [70, 320],
  A: [300, 320],
  C: [500, 320],
  B: [720, 320],
  E: [930, 320],
  N: [500, 110],
  NW: [300, 110],
  NE: [720, 110],
  S: [500, 540],
  SW: [300, 540],
  SE: [720, 540],
};

const CORRIDORS: [number, number, number, number][] = [
  [70, 290, 930, 60], // main east-west
  [470, 80, 60, 490], // north-south spine
  [70, 80, 930, 60], // north wing
  [70, 510, 930, 60], // south wing
];

export function CampusPlan({
  locations,
  route,
  selected,
  startNode,
  onSelect,
  compact = false,
  dark = false,
  className = "",
}: Props) {
  const stroke = dark ? "#2fe2e6" : "#0e1633";
  const faint = dark ? "rgba(47,226,230,0.35)" : "rgba(14,22,51,0.28)";
  const roomFill = dark ? "rgba(47,226,230,0.06)" : "#e7e1d4";
  const label = dark ? "#2fe2e6" : "#0e1633";
  const routePts = route?.length
    ? route.map(([x, y]) => `${x},${y}`).join(" ")
    : null;
  const dest = locations.find((l) => l.code === selected);
  const start = startNode ? NODE_POINTS[startNode] : undefined;

  return (
    <svg
      viewBox="0 0 1000 640"
      className={`h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Plano ng Main Building ground floor"
    >
      <defs>
        <pattern
          id="gabay-grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M40 0H0V40"
            fill="none"
            stroke={faint}
            strokeWidth="0.6"
            opacity="0.5"
          />
        </pattern>
        <filter id="gabay-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="1000" height="640" fill="url(#gabay-grid)" />

      {/* corridors */}
      {CORRIDORS.map(([x, y, w, h], i) => (
        <g key={i}>
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill={dark ? "rgba(47,226,230,0.05)" : "#f7f4ee"}
            stroke={faint}
            strokeWidth="1.4"
          />
          <line
            x1={x + 12}
            y1={y + h / 2}
            x2={x + w - 12}
            y2={y + h / 2}
            stroke={faint}
            strokeWidth="1.6"
            strokeDasharray="14 12"
            opacity={i % 2 === 0 ? 1 : 0}
          />
          {i === 1 && (
            <line
              x1={x + w / 2}
              y1={y + 12}
              x2={x + w / 2}
              y2={y + h - 12}
              stroke={faint}
              strokeWidth="1.6"
              strokeDasharray="14 12"
            />
          )}
        </g>
      ))}

      {/* rooms */}
      {locations.map((l) => {
        const isSel = l.code === selected;
        return (
          <g
            key={l.code}
            onClick={onSelect ? () => onSelect(l.code) : undefined}
            className={onSelect ? "cursor-pointer" : undefined}
          >
            <rect
              x={l.mapX}
              y={l.mapY}
              width={l.mapW}
              height={l.mapH}
              fill={isSel ? "rgba(224,52,42,0.12)" : roomFill}
              stroke={isSel ? "#e0342a" : stroke}
              strokeWidth={isSel ? 3 : 1.6}
              filter={isSel ? "url(#gabay-glow)" : undefined}
            />
            {!compact && (
              <>
                <text
                  x={l.mapX + 9}
                  y={l.mapY + 21}
                  fontFamily="IBM Plex Mono, monospace"
                  fontSize="15"
                  fontWeight="600"
                  fill={isSel ? "#e0342a" : label}
                  letterSpacing="0.06em"
                >
                  {l.code}
                </text>
                <text
                  x={l.mapX + 9}
                  y={l.mapY + l.mapH - 9}
                  fontFamily="Archivo, sans-serif"
                  fontSize="12.5"
                  fill={dark ? "rgba(242,238,230,0.7)" : "#6a6757"}
                >
                  {l.name.length > 22 ? `${l.name.slice(0, 21)}…` : l.name}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* graph nodes */}
      {!compact &&
        Object.entries(NODE_POINTS).map(([id, [x, y]]) => (
          <g key={id}>
            <circle
              cx={x}
              cy={y}
              r="5.5"
              fill={dark ? "#070912" : "#f2eee6"}
              stroke={stroke}
              strokeWidth="2"
            />
          </g>
        ))}

      {/* route */}
      {routePts && (
        <polyline
          points={routePts}
          fill="none"
          stroke="#2fe2e6"
          strokeWidth={compact ? 9 : 7}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#gabay-glow)"
          opacity="0.95"
        />
      )}

      {/* start dot */}
      {start && (
        <g>
          <circle cx={start[0]} cy={start[1]} r="11" fill="#1b2c8a" />
          <circle
            cx={start[0]}
            cy={start[1]}
            r="19"
            fill="none"
            stroke="#1b2c8a"
            strokeWidth="2"
            opacity="0.5"
          />
          <text
            x={start[0] + 26}
            y={start[1] + 5}
            fontFamily="IBM Plex Mono, monospace"
            fontSize="13"
            fill={dark ? "#2fe2e6" : "#1b2c8a"}
            letterSpacing="0.1em"
          >
            YOU
          </text>
        </g>
      )}

      {/* destination pin */}
      {dest && (
        <g
          transform={`translate(${dest.mapX + dest.mapW / 2 - 16}, ${
            dest.mapY - 40
          })`}
        >
          <path
            d="M16 0C7.2 0 0 7.2 0 16c0 11 16 28 16 28s16-17 16-28C32 7.2 24.8 0 16 0Z"
            fill="#e0342a"
            stroke="#0e1633"
            strokeWidth="2"
          />
          <circle cx="16" cy="15" r="6" fill="#f2eee6" stroke="#0e1633" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}
