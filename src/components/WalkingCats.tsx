import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { keyframes } from "@emotion/react";

// Two cats stroll along the bottom of the page. The tabby is faster, and when it
// catches up to (or meets) the black cat, it leaps over and lands on the far side.
// Clicking a cat sends a heart floating up from its head; hovering shows its name.

const CAT_W = 72;
const CAT_H = 48;
const JUMP_MS = 700;
const JUMP_HEIGHT = 56;
const JUMP_TRIGGER_GAP = 14; // px between the cats when the tabby takes off
const LANDING_GAP = 8;

interface Cat {
  x: number;
  dir: 1 | -1;
  speed: number; // px per second
  jump: { start: number; fromX: number; toX: number } | null;
  lift: number; // px above the ground, while jumping
}

const HEART_MS = 1200;
const HEART_PATH =
  "M12 21s-7-4.5-9.5-9C.5 8 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 4 23.5 8 21.5 12 19 16.5 12 21 12 21z";

const floatUp = keyframes`
  0% { transform: translate(-50%, 0) scale(0.3); opacity: 0; }
  15% { transform: translate(-50%, -10px) scale(1); opacity: 1; }
  100% { transform: translate(calc(-50% + var(--dx)), -90px) scale(1.15) rotate(var(--spin)); opacity: 0; }
`;

const swingA = keyframes`
  0%, 100% { transform: rotate(18deg); }
  50% { transform: rotate(-18deg); }
`;
const swingB = keyframes`
  0%, 100% { transform: rotate(-18deg); }
  50% { transform: rotate(18deg); }
`;
const sway = keyframes`
  0%, 100% { transform: rotate(-6deg); }
  50% { transform: rotate(8deg); }
`;

interface CatColors {
  fur: string;
  stripes?: string;
  eye: string;
  nose: string;
}

const BLACK: CatColors = { fur: "#1f1f24", eye: "#c8d84a", nose: "#3a3a42" };
const TABBY: CatColors = { fur: "#9c9a98", stripes: "#4e4b48", eye: "#d4e04a", nose: "#d98a94" };

// Side view facing right; flipped with scaleX(-1) to walk left.
function CatSvg({ colors }: { colors: CatColors }) {
  const { fur, stripes, eye, nose } = colors;
  return (
    <svg viewBox="0 0 60 40" width={CAT_W} height={CAT_H} aria-hidden="true">
      <path
        className="tail"
        d="M13 20 Q3 19 5 7"
        stroke={fur}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
      <rect className="leg leg-a" x={16} y={26} width={3.5} height={11} rx={1.5} fill={fur} />
      <rect className="leg leg-b" x={21} y={26} width={3.5} height={11} rx={1.5} fill={fur} />
      <rect className="leg leg-b" x={34} y={26} width={3.5} height={11} rx={1.5} fill={fur} />
      <rect className="leg leg-a" x={39} y={26} width={3.5} height={11} rx={1.5} fill={fur} />
      <ellipse cx={28} cy={22} rx={17} ry={8.5} fill={fur} />
      <polygon points="40,11 42,1 47,8" fill={fur} />
      <polygon points="48,8 53,1 54,12" fill={fur} />
      <circle cx={47} cy={15} r={8} fill={fur} />
      {stripes && (
        <g stroke={stripes} strokeWidth={2} strokeLinecap="round" fill="none">
          <path d="M19 15 Q21 19 19 23" />
          <path d="M25 14 Q27 19 25 24" />
          <path d="M31 14 Q33 19 31 24" />
          <path d="M37 15 Q39 19 37 23" />
          <path d="M45 8 L46 11" />
          <path d="M48 7.5 L48 10.5" />
        </g>
      )}
      <circle cx={50.5} cy={13.5} r={2.3} fill={eye} />
      <ellipse cx={51} cy={13.5} rx={0.7} ry={1.7} fill="#111" />
      <circle cx={54.5} cy={17} r={1} fill={nose} />
    </svg>
  );
}

function walkingSx(stepSeconds: number) {
  return {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    width: CAT_W,
    height: CAT_H,
    willChange: "transform",
    pointerEvents: "auto" as const,
    cursor: "pointer",
    "& svg": { display: "block", transition: "transform 120ms" },
    "& .leg, & .tail": { transformBox: "fill-box", transformOrigin: "top center" },
    "& .tail": { transformOrigin: "bottom left", animation: `${sway} 1.6s ease-in-out infinite` },
    "& .leg-a": { animation: `${swingA} ${stepSeconds}s ease-in-out infinite` },
    "& .leg-b": { animation: `${swingB} ${stepSeconds}s ease-in-out infinite` },
    // Legs tuck while airborne
    "&[data-jumping='true'] .leg": { animationPlayState: "paused", transform: "rotate(35deg)" },
    "&:hover .nametag": { opacity: 1 },
  };
}

// Minecraft-style name tag: translucent black box, white pixel text, no rounding.
function NameTag({ name }: { name: string }) {
  return (
    <Box
      className="nametag"
      sx={{
        position: "absolute",
        bottom: CAT_H + 4,
        left: "50%",
        transform: "translateX(-50%)",
        px: "4px",
        py: "3px",
        bgcolor: "rgba(0, 0, 0, 0.45)",
        color: "#ffffff",
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 8,
        lineHeight: 1,
        whiteSpace: "nowrap",
        opacity: 0,
        transition: "opacity 120ms",
        pointerEvents: "none",
      }}
    >
      {name}
    </Box>
  );
}

function bounce(cat: Cat, width: number) {
  if (cat.x < 0) {
    cat.x = 0;
    cat.dir = 1;
  } else if (cat.x > width - CAT_W) {
    cat.x = width - CAT_W;
    cat.dir = -1;
  }
}

export default function WalkingCats() {
  const groundEl = useRef<HTMLDivElement>(null);
  const blackEl = useRef<HTMLDivElement>(null);
  const tabbyEl = useRef<HTMLDivElement>(null);
  const cats = useRef<{ black: Cat; tabby: Cat } | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const width0 = window.innerWidth;
    const black: Cat = { x: width0 * 0.2, dir: 1, speed: 38, jump: null, lift: 0 };
    const tabby: Cat = { x: width0 * 0.7, dir: -1, speed: 70, jump: null, lift: 0 };
    cats.current = { black, tabby };

    let last = performance.now();
    let frame = 0;

    function tick(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const width = window.innerWidth;

      black.x += black.dir * black.speed * dt;
      bounce(black, width);

      tabby.lift = 0;
      if (tabby.jump) {
        const p = (now - tabby.jump.start) / JUMP_MS;
        if (p >= 1) {
          tabby.x = tabby.jump.toX;
          tabby.jump = null;
        } else {
          tabby.x = tabby.jump.fromX + (tabby.jump.toX - tabby.jump.fromX) * p;
          tabby.lift = Math.sin(Math.PI * p) * JUMP_HEIGHT;
        }
      } else {
        tabby.x += tabby.dir * tabby.speed * dt;
        bounce(tabby, width);

        // Gap from the tabby's nose to the black cat, in the tabby's walking direction.
        const ahead =
          tabby.dir === 1 ? black.x - (tabby.x + CAT_W) : tabby.x - (black.x + CAT_W);
        const closing = tabby.speed - black.dir * tabby.dir * black.speed;

        if (ahead < JUMP_TRIGGER_GAP && ahead > -2 * CAT_W && closing > 0) {
          // Land just past where the black cat will be when the jump ends.
          const blackLater = black.x + black.dir * black.speed * (JUMP_MS / 1000);
          const toX =
            tabby.dir === 1
              ? blackLater + CAT_W + LANDING_GAP
              : blackLater - CAT_W - LANDING_GAP;

          if (toX < 0 || toX > width - CAT_W) tabby.dir = tabby.dir === 1 ? -1 : 1;
          else tabby.jump = { start: now, fromX: tabby.x, toX };
        }
      }

      for (const [cat, el] of [
        [black, blackEl.current],
        [tabby, tabbyEl.current],
      ] as const) {
        if (!el) continue;
        el.style.transform = `translate(${cat.x}px, ${-cat.lift}px)`;
        el.dataset.jumping = String(!!cat.jump);
        const svg = el.firstElementChild as SVGElement | null;
        if (svg) svg.style.transform = `scaleX(${cat.dir})`;
      }

      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Hearts are plain DOM nodes so a burst of clicks doesn't re-render React.
  function sendHeart(which: "black" | "tabby") {
    const cat = cats.current?.[which];
    const ground = groundEl.current;
    if (!cat || !ground) return;

    const heart = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    heart.setAttribute("viewBox", "0 0 24 24");
    heart.setAttribute("class", "cat-heart");
    heart.innerHTML = `<path d="${HEART_PATH}" fill="#e5486b" />`;
    // Start at the cat's head, which is on the side it's facing.
    heart.style.left = `${cat.x + CAT_W * (cat.dir === 1 ? 0.8 : 0.2)}px`;
    heart.style.bottom = `${CAT_H - 6 + cat.lift}px`;
    heart.style.setProperty("--dx", `${Math.round((Math.random() - 0.5) * 40)}px`);
    heart.style.setProperty("--spin", `${Math.round((Math.random() - 0.5) * 40)}deg`);
    heart.addEventListener("animationend", () => heart.remove());
    ground.appendChild(heart);
  }

  return (
    <Box
      ref={groundEl}
      aria-hidden="true"
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: CAT_H + JUMP_HEIGHT,
        pointerEvents: "none",
        zIndex: 1,
        "@media (prefers-reduced-motion: reduce)": { display: "none" },
        "& .cat-heart": {
          position: "absolute",
          width: 22,
          height: 22,
          animation: `${floatUp} ${HEART_MS}ms ease-out forwards`,
        },
      }}
    >
      {/* pointerdown, not click: a walking cat can slip out from under the
          cursor before mouseup, which silently cancels a click. */}
      <Box ref={blackEl} sx={walkingSx(0.7)} onPointerDown={() => sendHeart("black")}>
        <CatSvg colors={BLACK} />
        <NameTag name="Penelope" />
      </Box>
      <Box ref={tabbyEl} sx={walkingSx(0.45)} onPointerDown={() => sendHeart("tabby")}>
        <CatSvg colors={TABBY} />
        <NameTag name="Chappo" />
      </Box>
    </Box>
  );
}
