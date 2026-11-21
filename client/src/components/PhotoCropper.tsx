import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

// Photo editor for the application (owner's request 21.11.2026): the seafarer moves and zooms the photo
// under a 3:4 frame with a circle in it. The CRM shows the avatar as the centre circle of the 3:4 picture
// (object-cover, rounded-full) and the AURA SEA form uses the whole 3:4 portrait — so what is inside the
// circle here is exactly the seafarer's round avatar in the CRM.
//
// Drag with a finger or the mouse, zoom with the slider, the wheel, two fingers, or the keyboard
// (arrows move, + and − zoom). No library: one <img> moved by transform, the result drawn on a canvas.

/** Size of the picture sent to the CRM: 3:4, enough for the form and the 480×640 avatar. */
const OUT_W = 600;
const OUT_H = 800;
const MAX_ZOOM = 4;

type View = { zoom: number; x: number; y: number }; // zoom ≥ 1 over "cover"; x, y — image centre offset in frame px

export function PhotoCropper({
  image,
  onDone,
  onCancel,
}: {
  /** The photo as decoded by the browser (already turned by EXIF). */
  image: ImageBitmap;
  onDone: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameW, setFrameW] = useState(300);
  const frameH = (frameW * 4) / 3;
  const [view, setView] = useState<View>({ zoom: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const [src] = useState(() => {
    const c = document.createElement("canvas");
    c.width = image.width;
    c.height = image.height;
    c.getContext("2d")?.drawImage(image, 0, 0);
    return c.toDataURL("image/jpeg", 0.92);
  });

  // While the editor is open the page under it does not scroll; the frame takes the keyboard
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    frameRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // The frame follows the dialog's width (phone or desktop)
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFrameW(el.clientWidth));
    ro.observe(el);
    setFrameW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  /** Scale at which the photo just covers the frame. */
  const cover = Math.max(frameW / image.width, frameH / image.height);

  /** Keep the frame filled: the photo may not slide past its edges. */
  const clamp = useCallback(
    (v: View): View => {
      const zoom = Math.min(MAX_ZOOM, Math.max(1, v.zoom));
      const w = image.width * cover * zoom;
      const h = image.height * cover * zoom;
      const mx = Math.max(0, (w - frameW) / 2);
      const my = Math.max(0, (h - frameH) / 2);
      return { zoom, x: Math.min(mx, Math.max(-mx, v.x)), y: Math.min(my, Math.max(-my, v.y)) };
    },
    [cover, frameW, frameH, image.width, image.height]
  );

  useEffect(() => setView((v) => clamp(v)), [clamp]);

  const zoomBy = (factor: number) => setView((v) => clamp({ ...v, zoom: v.zoom * factor }));

  const onPointerDown = (e: ReactPointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: view.zoom };
    }
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const next = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, next);
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const base = pinch.current;
      setView((v) => clamp({ ...v, zoom: (base.zoom * dist) / base.dist }));
      return;
    }
    setView((v) => clamp({ ...v, x: v.x + next.x - prev.x, y: v.y + next.y - prev.y }));
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  // Wheel zoom must not scroll the page under the dialog
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      setView((v) => clamp({ ...v, zoom: v.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08) }));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [clamp]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 40 : 12;
    const moves: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[e.key]) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      setView((v) => clamp({ ...v, x: v.x + dx, y: v.y + dy }));
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      zoomBy(1.1);
    } else if (e.key === "-") {
      e.preventDefault();
      zoomBy(1 / 1.1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const done = () => {
    const s = cover * view.zoom; // frame px per image px
    const canvas = document.createElement("canvas");
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // The part of the photo under the frame, in image pixels
    const sw = frameW / s;
    const sh = frameH / s;
    const sx = image.width / 2 - view.x / s - sw / 2;
    const sy = image.height / 2 - view.y / s - sh / 2;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, OUT_W, OUT_H);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, OUT_W, OUT_H);
    onDone(canvas.toDataURL("image/jpeg", 0.88));
  };

  const w = image.width * cover * view.zoom;
  const h = image.height * cover * view.zoom;

  // Rendered into <body>: inside the application step (an animated, transformed block) "fixed" would
  // be relative to the step, not the screen
  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="crop-title" data-testid="photo-cropper">
      <div className="glass-card w-full max-w-sm rounded-2xl p-5 sm:p-6">
        <h2 id="crop-title" className="font-headline text-xl font-semibold text-foreground">
          {t("Position your photo", "Розмістіть фото")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("Drag and zoom so your face fits the circle — that is your photo in our base.", "Посуньте й збільште, щоб обличчя було в колі — так фото буде в нашій базі.")}
        </p>

        <div
          ref={frameRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label={t("Photo frame. Arrows move, plus and minus zoom.", "Рамка фото. Стрілки посувають, плюс і мінус збільшують.")}
          className="relative mt-4 w-full aspect-[3/4] overflow-hidden rounded-xl bg-black touch-none select-none cursor-grab active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          data-testid="crop-frame"
        >
          <img
            src={src}
            alt=""
            draggable={false}
            className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
            style={{ width: w, height: h, transform: `translate(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px))` }}
          />
          {/* Darkened outside the circle; the circle is what the CRM shows */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${frameW} ${frameH}`} aria-hidden="true">
            <defs>
              <mask id="crop-hole">
                <rect width={frameW} height={frameH} fill="white" />
                <circle cx={frameW / 2} cy={frameH / 2} r={frameW / 2 - 2} fill="black" />
              </mask>
            </defs>
            <rect width={frameW} height={frameH} fill="rgba(0,0,0,0.55)" mask="url(#crop-hole)" />
            <circle cx={frameW / 2} cy={frameH / 2} r={frameW / 2 - 2} fill="none" stroke="#66e4f5" strokeWidth="2" />
          </svg>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={() => zoomBy(1 / 1.15)} className="grid size-11 place-items-center rounded-full border border-border text-foreground" aria-label={t("Zoom out", "Зменшити")}>
            <Minus className="w-5 h-5" aria-hidden="true" />
          </button>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={view.zoom}
            onChange={(e) => setView((v) => clamp({ ...v, zoom: Number(e.target.value) }))}
            className="flex-1 accent-cyan-400"
            aria-label={t("Zoom", "Масштаб")}
            data-testid="crop-zoom"
          />
          <button type="button" onClick={() => zoomBy(1.15)} className="grid size-11 place-items-center rounded-full border border-border text-foreground" aria-label={t("Zoom in", "Збільшити")}>
            <Plus className="w-5 h-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setView({ zoom: 1, x: 0, y: 0 })} className="grid size-11 place-items-center rounded-full border border-border text-foreground" aria-label={t("Reset", "Скинути")}>
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 flex gap-3">
          <Button type="button" variant="secondary" className="h-12 flex-1 text-base" onClick={onCancel}>
            {t("Cancel", "Скасувати")}
          </Button>
          <Button type="button" className="h-12 flex-1 text-base !text-white" onClick={done} data-testid="crop-done">
            {t("Done", "Готово")}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
