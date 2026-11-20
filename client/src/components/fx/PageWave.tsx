import { useEffect, useRef } from "react";
import { DistortionWave, type DistortionWaveHandle } from "distortion-waves";

// One colourful distortion wave for the whole site (owner's decision 20.11.2026, the
// `distortion-waves` package pinned at 0.1.0): it runs across the screen from the button or link
// the visitor pressed when the view changes — a new page, a language, a step of the application.
// It draws the wave's colour only — the ring, the glow on the screen edges and the sparks — and does
// not bend a picture of the page: the package pictures the DOM, and a page that is still animating in,
// with glass (backdrop blur), came out with shifted and doubled text (tried 20.11.2026).
// With "reduce motion" on, or without WebGL 2, the package plays a plain crossfade instead.

type Source = Element | { x: number; y: number; w: number; h: number } | null;
const EVENT = "aurasea:wave";

let lastPressed: Element | null = null;
let pressedAt = 0;
let startedAt = 0;

/**
 * Run the wave from this element; by default from the control just pressed (mouse or touch), else the
 * focused one (keyboard). A second call within a moment is ignored: a click that changes the step
 * and the page at once shows one wave, not two.
 */
export function playWave(source?: Source) {
  const now = performance.now();
  if (now - startedAt < 900) return;
  startedAt = now;
  const pressed = now - pressedAt < 1500 ? lastPressed : null;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: source ?? pressed ?? document.activeElement }));
}

export function PageWave() {
  const wave = useRef<DistortionWaveHandle>(null);

  useEffect(() => {
    // Remember the control pressed last: a page change starts the wave from it
    const press = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.("a, button, [role=button], label");
      if (el) {
        lastPressed = el;
        pressedAt = performance.now();
      }
    };
    const run = (e: Event) => {
      const src = (e as CustomEvent<Source>).detail;
      let rect: { x: number; y: number; w: number; h: number } | undefined;
      if (src instanceof Element && src.isConnected) {
        const r = src.getBoundingClientRect();
        if (r.width && r.height && r.bottom > 0 && r.top < innerHeight) rect = { x: r.left, y: r.top, w: r.width, h: r.height };
      } else if (src && !(src instanceof Element)) rect = src;
      // A control that is gone or off screen: the wave rises from the bottom middle
      rect ??= { x: innerWidth / 2 - 40, y: innerHeight - 60, w: 80, h: 40 };
      wave.current?.play({ source: rect });
    };
    window.addEventListener("pointerdown", press, { capture: true });
    window.addEventListener(EVENT, run);
    return () => {
      window.removeEventListener("pointerdown", press, { capture: true });
      window.removeEventListener(EVENT, run);
    };
  }, []);

  return (
    <DistortionWave
      ref={wave}
      aria-hidden="true"
      type="center"
      palette="ocean"
      capture={false}
      // Stronger rim and more sparks than the defaults: with no lens, colour carries the wave
      waveStyle={{ rimStrength: 1.1, rimWidth: 30, particleCount: 120, particleSize: 2.6, gatherGlow: 0.8 }}
      prewarm={false}
      className="pointer-events-none fixed inset-0 z-[110]"
      style={{ background: "transparent" }}
      data-testid="page-wave"
    >
      <div className="h-full w-full" />
    </DistortionWave>
  );
}
