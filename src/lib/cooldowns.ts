// A picked name sits out this many spins (stays on the wheel but can't be picked), then is pickable again.
export const SIT_OUT_SPINS = 3;

// Name -> spins left before it can be picked again. Names not in the map can be picked.
export type Cooldowns = Record<string, number>;

export function afterSpin(cooldowns: Cooldowns, picked: string): Cooldowns {
  const next: Cooldowns = {};
  for (const [name, left] of Object.entries(cooldowns)) {
    if (left > 1) next[name] = left - 1;
  }
  next[picked] = SIT_OUT_SPINS;
  return next;
}

// Names the next spin can land on. If everyone is sitting out (fewer than
// SIT_OUT_SPINS + 1 names), whoever is closest to coming back is let back early.
export function pickableNames(names: string[], cooldowns: Cooldowns): string[] {
  const ready = names.filter((n) => !cooldowns[n]);
  if (ready.length > 0 || names.length === 0) return ready;

  const soonest = Math.min(...names.map((n) => cooldowns[n]));
  return names.filter((n) => cooldowns[n] === soonest);
}
