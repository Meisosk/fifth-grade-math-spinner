import { Box } from "@mui/material";

interface SpinnerWheelProps {
  names: string[];
  // Cumulative clockwise rotation in degrees. The parent animates a spin by increasing it.
  rotation: number;
  spinMs: number;
}

const R = 100;
const MAX_LABEL = 14;

// Angles are degrees clockwise from the top, where the pointer sits.
function point(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return `${radius * Math.sin(rad)} ${-radius * Math.cos(rad)}`;
}

function segmentPath(start: number, end: number) {
  const largeArc = end - start > 180 ? 1 : 0;
  return `M 0 0 L ${point(start, R)} A ${R} ${R} 0 ${largeArc} 1 ${point(end, R)} Z`;
}

function label(name: string) {
  return name.length > MAX_LABEL ? `${name.slice(0, MAX_LABEL - 1)}…` : name;
}

export default function SpinnerWheel({
  names,
  rotation,
  spinMs,
}: SpinnerWheelProps) {
  const slice = 360 / Math.max(names.length, 1);
  const fontSize = names.length <= 8 ? 10 : names.length <= 16 ? 8 : 6;

  return (
    <Box
      sx={{
        position: "relative",
        width: "min(85vw, 420px)",
        aspectRatio: "1",
        mx: "auto",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          transform: `rotate(${rotation}deg)`,
          transition: `transform ${spinMs}ms cubic-bezier(0.15, 0.7, 0.1, 1)`,
        }}
      >
        <svg
          viewBox={`${-R - 4} ${-R - 4} ${2 * R + 8} ${2 * R + 8}`}
          width="100%"
          height="100%"
          role="img"
          aria-label={`Spinner wheel with ${names.length} names`}
        >
          {names.length === 0 && (
            <circle r={R} fill="#cfd8dc" />
          )}
          {names.map((name, i) => {
            const start = i * slice;
            const mid = start + slice / 2;
            const fill = `hsl(${(i * 360) / names.length}, 70%, 72%)`;
            return (
              <g key={name}>
                {names.length === 1 ? (
                  <circle r={R} fill={fill} />
                ) : (
                  <path
                    d={segmentPath(start, start + slice)}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                )}
                <text
                  transform={`rotate(${mid - 90})`}
                  x={R * 0.9}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={fontSize}
                  fontWeight={700}
                  fill="#1f2a36"
                >
                  {label(name)}
                </text>
              </g>
            );
          })}
          <circle r={R} fill="none" strokeWidth={3} style={{ stroke: "var(--mui-palette-primary-main)" }} />
          <circle r={10} style={{ fill: "var(--mui-palette-primary-main)" }} />
        </svg>
      </Box>

      {/* Fixed pointer at the top: a pencil, tip down */}
      <Box
        component="svg"
        viewBox="0 0 20 56"
        sx={{
          position: "absolute",
          top: -34,
          left: "50%",
          width: 20,
          transform: "translateX(-50%)",
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))",
        }}
      >
        <rect x={3} y={0} width={14} height={8} rx={2.5} fill="#E89AA6" />
        <rect x={3} y={7} width={14} height={5} fill="#B9BEC4" />
        <rect x={3} y={12} width={14} height={26} fill="#F2C230" />
        <rect x={7.5} y={12} width={1.2} height={26} fill="#D9A21B" />
        <rect x={11.5} y={12} width={1.2} height={26} fill="#D9A21B" />
        <polygon points="3,38 17,38 10,53" fill="#E8C8A0" />
        <polygon points="7.7,48 12.3,48 10,53" fill="#3A3A3A" />
      </Box>
    </Box>
  );
}
