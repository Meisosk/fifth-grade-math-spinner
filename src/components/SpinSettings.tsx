import { useState } from "react";
import {
  Box,
  Divider,
  FormControlLabel,
  IconButton,
  Popover,
  Slider,
  SvgIcon,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { SIT_OUT_SPINS } from "../lib/cooldowns";

interface SpinSettingsProps {
  spinSeconds: number;
  onChange: (seconds: number) => void;
  focusMode: boolean;
  onFocusModeChange: (on: boolean) => void;
  sitOut: boolean;
  onSitOutChange: (on: boolean) => void;
}

export const MIN_SPIN_SECONDS = 1;
export const MAX_SPIN_SECONDS = 10;

// Material "Tune" icon, inlined to avoid pulling in @mui/icons-material for one icon.
function TuneIcon() {
  return (
    <SvgIcon>
      <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
    </SvgIcon>
  );
}

export default function SpinSettings({
  spinSeconds,
  onChange,
  focusMode,
  onFocusModeChange,
  sitOut,
  onSitOutChange,
}: SpinSettingsProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <Tooltip title="Spin settings">
        <IconButton
          aria-label="Spin settings"
          color="primary"
          onClick={(e) => setAnchor(e.currentTarget)}
        >
          <TuneIcon />
        </IconButton>
      </Tooltip>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ p: 2, width: 260 }}>
          <Typography id="spin-time-label" gutterBottom>
            Spin time: {spinSeconds}s
          </Typography>
          <Slider
            aria-labelledby="spin-time-label"
            value={spinSeconds}
            min={MIN_SPIN_SECONDS}
            max={MAX_SPIN_SECONDS}
            step={0.5}
            marks={[
              { value: MIN_SPIN_SECONDS, label: `${MIN_SPIN_SECONDS}s` },
              { value: MAX_SPIN_SECONDS, label: `${MAX_SPIN_SECONDS}s` },
            ]}
            valueLabelDisplay="auto"
            onChange={(_, value) => onChange(value as number)}
          />
          <Divider sx={{ my: 1.5 }} />
          <FormControlLabel
            control={
              <Switch
                checked={focusMode}
                onChange={(e) => onFocusModeChange(e.target.checked)}
              />
            }
            label="Focus Spin Wheel"
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            Shows only the wheel and the Spin button.
          </Typography>
          {!focusMode && (
            <>
              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Switch
                    checked={sitOut}
                    onChange={(e) => onSitOutChange(e.target.checked)}
                  />
                }
                label="Sitting out"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                A picked name can't be picked again for the next {SIT_OUT_SPINS} spins.
              </Typography>
            </>
          )}
        </Box>
      </Popover>
    </>
  );
}
