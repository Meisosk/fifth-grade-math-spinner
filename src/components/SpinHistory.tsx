import { Box, Typography } from "@mui/material";

export interface HistoryEntry {
  spin: number;
  name: string;
}

// Each older pick is fainter than the one above it, down to this floor.
const FADE_STEP = 0.12;
const MIN_OPACITY = 0.2;

export default function SpinHistory({ history }: { history: HistoryEntry[] }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        History
      </Typography>
      {history.length === 0 ? (
        <Typography color="text.secondary">No spins yet.</Typography>
      ) : (
        <Box
          component="ol"
          sx={{
            listStyle: "none",
            p: 0,
            m: 0,
            maxHeight: { md: 460 },
            overflowY: "auto",
            // Scrollable, but with no visible scrollbar
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {history.map((entry, i) => (
            <Box
              component="li"
              key={entry.spin}
              sx={{
                py: 0.75,
                opacity: Math.max(MIN_OPACITY, 1 - i * FADE_STEP),
                transition: "opacity 300ms",
              }}
            >
              <Typography sx={{ fontWeight: i === 0 ? 700 : 500, lineHeight: 1.2 }}>
                {entry.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Spin {entry.spin}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
