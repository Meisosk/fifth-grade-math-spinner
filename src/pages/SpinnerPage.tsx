import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Footer from "../components/Footer";
import SpinHistory, { type HistoryEntry } from "../components/SpinHistory";
import SpinSettings from "../components/SpinSettings";
import SpinnerWheel from "../components/SpinnerWheel";
import UserPickerDialog from "../components/UserPickerDialog";
import WalkingCats from "../components/WalkingCats";
import { afterSpin, namesOnWheel, type Cooldowns } from "../lib/cooldowns";
import {
  fetchNames,
  isSavedUser,
  saveNames,
  type SavedUser,
  type SpinnerUser,
} from "../lib/names";

const DEFAULT_SPIN_SECONDS = 4.5;
const SAVE_DELAY_MS = 600;
const MAX_NAME_LENGTH = 50;

type SaveStatus = "idle" | "saving" | "saved" | "error";

// About one full turn per second, so short and long spins both look natural.
function fullTurns(seconds: number) {
  return Math.max(2, Math.round(seconds));
}

// Trims, splits pasted "a, b, c" into separate names, and drops case-insensitive duplicates.
function cleanNames(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values.flatMap((v) => v.split(/[,\n]/))) {
    const name = value.trim().slice(0, MAX_NAME_LENGTH);
    if (name && !seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      result.push(name);
    }
  }
  return result;
}

export default function SpinnerPage() {
  const [user, setUser] = useState<SpinnerUser | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [loadingNames, setLoadingNames] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Spin state lives in memory only, so a refresh starts fresh.
  const [cooldowns, setCooldowns] = useState<Cooldowns>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [rotation, setRotation] = useState(0);
  const [spinSeconds, setSpinSeconds] = useState(DEFAULT_SPIN_SECONDS);
  const [spinMs, setSpinMs] = useState(DEFAULT_SPIN_SECONDS * 1000);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const spinTimer = useRef<number | undefined>(undefined);
  const saveTimer = useRef<number | undefined>(undefined);
  const pendingSave = useRef<{ user: SavedUser; names: string[] } | null>(
    null
  );

  const wheel = namesOnWheel(names, cooldowns);
  const sittingOut = names.filter((n) => cooldowns[n] && !wheel.includes(n));

  // Flush an unsaved edit if the page is closed or refreshed mid-debounce.
  useEffect(() => {
    function flush() {
      if (pendingSave.current) {
        const { user, names } = pendingSave.current;
        saveNames(user, names, { keepalive: true }).catch(() => {});
      }
    }
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.clearTimeout(spinTimer.current);
      window.clearTimeout(saveTimer.current);
    };
  }, []);

  async function loadNames(picked: SavedUser) {
    setLoadingNames(true);
    setLoadError(null);
    try {
      setNames(await fetchNames(picked));
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setLoadingNames(false);
    }
  }

  function pickUser(picked: SpinnerUser) {
    setUser(picked);
    if (isSavedUser(picked)) loadNames(picked);
  }

  function switchUser() {
    window.clearTimeout(saveTimer.current);
    pendingSave.current = null;
    setUser(null);
    setNames([]);
    setLoadError(null);
    setSaveStatus("idle");
    setCooldowns({});
    setHistory([]);
    setWinner(null);
  }

  function changeNames(values: string[]) {
    const next = cleanNames(values);
    setNames(next);
    if (!user || !isSavedUser(user)) return;

    pendingSave.current = { user, names: next };
    setSaveStatus("saving");
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      pendingSave.current = null;
      try {
        await saveNames(user, next);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, SAVE_DELAY_MS);
  }

  function spin() {
    if (spinning || wheel.length === 0) return;

    const index = Math.floor(Math.random() * wheel.length);
    const picked = wheel[index];
    const slice = 360 / wheel.length;
    // Land somewhere inside the picked slice, away from its edges.
    const target = index * slice + slice * (0.15 + Math.random() * 0.7);
    const current = ((rotation % 360) + 360) % 360;
    const extra = (((360 - target - current) % 360) + 360) % 360;
    const duration = spinSeconds * 1000;

    setWinner(null);
    setSpinning(true);
    setSpinMs(duration);
    setRotation(rotation + fullTurns(spinSeconds) * 360 + extra);

    spinTimer.current = window.setTimeout(() => {
      setSpinning(false);
      setWinner(picked);
      setCooldowns((c) => afterSpin(c, picked));
      setHistory((h) => [{ spin: h.length + 1, name: picked }, ...h]);
    }, duration);
  }

  function reset() {
    setCooldowns({});
    setWinner(null);
  }

  const canEditNames = !!user && !loadingNames && !loadError && !spinning;

  return (
    <Box
      sx={(theme) => ({
        bgcolor: "background.default",
        minHeight: "100vh",
        // Faint ruled-notebook lines (chalk lines in dark mode)
        backgroundImage:
          "repeating-linear-gradient(to bottom, transparent 0 31px, rgba(91, 141, 184, 0.16) 31px 32px)",
        ...theme.applyStyles("dark", {
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0 31px, rgba(255, 255, 255, 0.05) 31px 32px)",
        }),
      })}
    >
      <UserPickerDialog open={user === null} onPick={pickUser} />

      <Box
        sx={{
          minHeight: "calc(100vh - 25px)",
          maxWidth: 1100,
          mx: "auto",
          px: 2,
          pt: 3,
          pb: 8, // room for the walking cats
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}
        >
          <Typography variant="h4" sx={{ color: "primary.main", fontSize: "2.6rem" }}>
            Name Spinner
          </Typography>
          {user && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Chip
                label={isSavedUser(user) ? user : "Anonymous (not saved)"}
                color="primary"
                variant="outlined"
              />
              <Button size="small" onClick={switchUser} disabled={spinning}>
                Switch user
              </Button>
              <SpinSettings spinSeconds={spinSeconds} onChange={setSpinSeconds} />
            </Stack>
          )}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "200px 1fr 340px" },
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* History: left column on desktop, below everything on mobile */}
          <Box sx={{ order: { xs: 3, md: 0 }, pt: 2 }}>
            <SpinHistory history={history} />
          </Box>

          {/* Wheel */}
          <Stack spacing={2} sx={{ alignItems: "center", pt: 5 /* room for the pencil pointer */ }}>
            <SpinnerWheel names={wheel} rotation={rotation} spinMs={spinMs} />
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={spin}
                disabled={spinning || wheel.length === 0}
                sx={{ fontWeight: 700, px: 5 }}
              >
                {spinning ? "Spinning…" : "Spin"}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={reset}
                disabled={spinning || Object.keys(cooldowns).length === 0}
              >
                Reset
              </Button>
            </Stack>
            <Box sx={{ minHeight: 56 }} aria-live="polite">
              {winner && (
                <Typography
                  variant="h3"
                  sx={{ color: "primary.main", textAlign: "center" }}
                >
                  {winner}!
                </Typography>
              )}
              {!winner && names.length === 0 && user && !loadingNames && (
                <Typography color="text.secondary">
                  Add some names to get started.
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Names, sitting out */}
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Names
              </Typography>
              {loadError && (
                <Alert
                  severity="error"
                  sx={{ mb: 1 }}
                  action={
                    user && isSavedUser(user) ? (
                      <Button color="inherit" size="small" onClick={() => loadNames(user)}>
                        Retry
                      </Button>
                    ) : undefined
                  }
                >
                  {loadError}. Is the server running?
                </Alert>
              )}
              <Autocomplete
                multiple
                freeSolo
                autoSelect
                options={[]}
                value={names}
                disabled={!canEditNames}
                onChange={(_, values) => changeNames(values)}
                renderValue={(values, getItemProps) =>
                  values.map((name, index) => {
                    const { key, ...itemProps } = getItemProps({ index });
                    return <Chip key={key} label={name} size="small" {...itemProps} />;
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={loadingNames ? "Loading…" : "Type a name, press Enter"}
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                {user && isSavedUser(user)
                  ? {
                      idle: `Saved to ${user}.`,
                      saving: "Saving…",
                      saved: `Saved to ${user}.`,
                      error: "Couldn't save. Your next change will try again.",
                    }[saveStatus]
                  : "Anonymous: names aren't saved."}
              </Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Sitting out
              </Typography>
              {sittingOut.length === 0 ? (
                <Typography color="text.secondary">Everyone is on the wheel.</Typography>
              ) : (
                <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                  {sittingOut.map((name) => (
                    <Chip
                      key={name}
                      label={`${name} · back in ${cooldowns[name]}`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Box>
      </Box>
      <Footer />
      <WalkingCats />
    </Box>
  );
}
