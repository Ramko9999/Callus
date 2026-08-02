"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toJpeg } from "html-to-image";
import { Agentation } from "agentation";
import { SLIDES, type SlideContent } from "../translations";

// ─── Constants ───────────────────────────────────────────────────────────────

const IPHONE_W = 1284;
const IPHONE_H = 2778;

const IPHONE_SIZES = [
  { label: '6.9"', w: 1320, h: 2868 },
  { label: '6.5"', w: 1284, h: 2778 },
  { label: '6.3"', w: 1206, h: 2622 },
  { label: '6.1"', w: 1125, h: 2436 },
] as const;

// ─── Design tokens ─────────────────────────────────────────────────────────────
// Callus brand (mobile/constants/Themes.ts darkColors) — a black app background
// with a blue accent. Screenshot slides mirror the app's dark theme rather than
// Readloom's warm beige/olive palette.

const ACCENT = "#28A0ED"; // darkColors.primaryAction

// The app itself is pure black, so the slide background must NOT be — a black
// screenshot on a black slide has no visible edge. A light slide makes the
// device read as a device and lets the blue accent carry the brand.
const BG = "linear-gradient(180deg, #FFFFFF 0%, #E7F0FA 100%)";
const TEXT = "#0B1220";
const SUBTEXT = "#5B6675";

const PHONE_BEZEL = "#0A0A0C"; // device body
const PHONE_FRAME = "#3F4147"; // darkColors.secondaryViewBorder — placeholder outline
const PHONE_SCREEN = "#27272F"; // darkColors.secondaryViewBackground — placeholder screen

const SANS = "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const PHONE_W_PCT = "82%";
const PHONE_BOTTOM_INSET = 0.04;

// ─── Slide frame ───────────────────────────────────────────────────────────────

function SlideFrame({
  w,
  h,
  children,
  bg = BG,
}: {
  w: number;
  h: number;
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        background: bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Caption ─────────────────────────────────────────────────────────────────

function Caption({
  headline,
  subhead,
  canvasW,
  color = TEXT,
  subColor = SUBTEXT,
  headlineScale = 1,
  fontWeight = 600,
}: {
  headline: React.ReactNode;
  subhead?: string;
  canvasW: number;
  color?: string;
  subColor?: string;
  headlineScale?: number;
  fontWeight?: number;
}) {
  return (
    <div style={{ textAlign: "center", padding: `0 ${canvasW * 0.08}px` }}>
      <h1
        style={{
          fontFamily: SANS,
          fontSize: canvasW * 0.082 * headlineScale,
          fontWeight,
          lineHeight: 1.12,
          color,
          margin: 0,
        }}
      >
        {headline}
      </h1>
      {subhead && (
        <p
          style={{
            fontFamily: SANS,
            fontSize: canvasW * 0.04,
            fontWeight: 400,
            lineHeight: 1.4,
            color: subColor,
            margin: 0,
            marginTop: canvasW * 0.035,
          }}
        >
          {subhead}
        </p>
      )}
    </div>
  );
}

// ─── Screenshot ──────────────────────────────────────────────────────────────
// Screenshots already include the device bezel, so we render the image directly
// (drop-shadow follows the transparent bezel silhouette). Falls back to a
// labelled placeholder until a matching file exists in `public/callus/screens`.

function Screenshot({
  label,
  src,
  width,
  maxHeight,
}: {
  label: string;
  src: string;
  width: number;
  maxHeight: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const radius = width * 0.11;
    return (
      <div
        style={{
          width,
          height: maxHeight,
          borderRadius: radius,
          border: `${width * 0.006}px dashed ${PHONE_FRAME}`,
          background: PHONE_SCREEN,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: width * 0.03,
          textAlign: "center",
          padding: `0 ${width * 0.1}px`,
          boxSizing: "border-box",
        }}
      >
        <span style={{ fontSize: width * 0.16, opacity: 0.5 }}>📵</span>
        <span style={{ fontFamily: SANS, fontSize: width * 0.06, fontWeight: 600, color: TEXT }}>
          {label}
        </span>
        <span style={{ fontFamily: SANS, fontSize: width * 0.038, color: SUBTEXT }}>
          drop a screenshot at {src}
        </span>
      </div>
    );
  }

  // simctl captures are raw screen content with no bezel, so draw the device
  // body here: a black frame with rounded corners, the screen clipped inside.
  const bezel = width * 0.028;
  const outerRadius = width * 0.125;
  const innerRadius = outerRadius - bezel;

  return (
    <div
      style={{
        width,
        padding: bezel,
        boxSizing: "border-box",
        background: PHONE_BEZEL,
        borderRadius: outerRadius,
        boxShadow: [
          "0 30px 70px rgba(11, 18, 32, 0.30)",
          "0 6px 18px rgba(11, 18, 32, 0.16)",
          `0 0 0 ${width * 0.0035}px rgba(255, 255, 255, 0.10) inset`,
        ].join(", "),
      }}
    >
      <div
        style={{
          borderRadius: innerRadius,
          overflow: "hidden",
          background: "#000",
          lineHeight: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          onError={() => setFailed(true)}
          style={{
            width: "100%",
            maxWidth: "none", // override Tailwind preflight's img { max-width: 100% }
            height: "auto",
            display: "block",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}

// ─── Feature slide ───────────────────────────────────────────────────────────
// UI-forward: caption on top, device screenshot anchored to the bottom.

// Screenshot filename per slide id (in public/callus/screens).
const SCREENSHOT_FILE: Record<string, string> = {
  "live-workout": "1-live-workout",
  "log-sets": "2-log-sets",
  progress: "3-progress",
  consistency: "4-consistency",
};

function FeatureSlide({
  w,
  h,
  content,
  screenLabel,
}: {
  w: number;
  h: number;
  content: SlideContent;
  screenLabel: string;
}) {
  const topMargin = h * 0.07;
  const captionHeight = w * 0.27;
  const bottomInset = h * PHONE_BOTTOM_INSET;
  const availableHeight = h - topMargin - captionHeight - bottomInset;
  const phoneWidth = (parseFloat(PHONE_W_PCT) / 100) * w * 1.1;
  const file = SCREENSHOT_FILE[content.id] ?? content.id;

  return (
    <SlideFrame w={w} h={h}>
      <div style={{ marginTop: topMargin, width: "100%" }}>
        <Caption
          headline={content.headline}
          subhead={content.subhead}
          canvasW={w}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: topMargin + captionHeight - h * 0.025,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Screenshot
          label={screenLabel}
          src={`/callus/screens/${file}.png`}
          width={phoneWidth}
          maxHeight={availableHeight}
        />
      </div>
    </SlideFrame>
  );
}

// ─── Slide dispatch ────────────────────────────────────────────────────────────

const SCREEN_LABELS: Record<string, string> = {
  "live-workout": "Live Workout",
  "log-sets": "Log Sets",
  progress: "Progress",
  consistency: "Consistency",
};

function renderSlide(content: SlideContent, w: number, h: number) {
  return (
    <FeatureSlide
      w={w}
      h={h}
      content={content}
      screenLabel={SCREEN_LABELS[content.id] ?? content.label}
    />
  );
}

// ─── Screenshot preview ──────────────────────────────────────────────────────

function ScreenshotPreview({
  slide,
  index,
  onExport,
}: {
  slide: SlideContent;
  index: number;
  onExport: (el: HTMLDivElement, id: string, index: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setScale(entry.contentRect.width / IPHONE_W);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">
          {slide.label}
        </span>
        <button
          onClick={() =>
            canvasRef.current && onExport(canvasRef.current, slide.id, index)
          }
          className="text-xs px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Export
        </button>
      </div>
      <div
        ref={containerRef}
        className="w-full bg-gray-100 rounded-lg overflow-hidden"
        style={{ aspectRatio: `${IPHONE_W}/${IPHONE_H}` }}
      >
        <div
          ref={canvasRef}
          data-export-canvas
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: IPHONE_W,
            height: IPHONE_H,
          }}
        >
          {renderSlide(slide, IPHONE_W, IPHONE_H)}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function ScreenshotsPage() {
  const [sizeIdx, setSizeIdx] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");

  const exportToServer = useCallback(
    async (dataUrl: string, id: string, index: number, sizeLabel: string) => {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: dataUrl,
          locale: "en-US",
          deviceType: "iphone",
          sizeLabel,
          slideId: id,
          index,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Export failed");
      }
      return res.json();
    },
    []
  );

  const captureSlide = useCallback(
    async (el: HTMLDivElement, targetW: number, targetH: number) => {
      const parent = el.parentElement!;
      const prevTransform = el.style.transform;
      const prevOverflow = parent.style.overflow;
      const prevHeight = parent.style.height;

      el.style.transform = "none";
      parent.style.overflow = "visible";
      parent.style.height = `${IPHONE_H}px`;

      await new Promise((r) => setTimeout(r, 200));

      const opts = { width: IPHONE_W, height: IPHONE_H, pixelRatio: 1, cacheBust: true };
      // Double-call works around html-to-image's first-render font/image miss.
      await toJpeg(el, { ...opts, quality: 0.95 });
      const fullResDataUrl = await toJpeg(el, { ...opts, quality: 0.95 });

      el.style.transform = prevTransform;
      parent.style.overflow = prevOverflow;
      parent.style.height = prevHeight;

      if (targetW !== IPHONE_W || targetH !== IPHONE_H) {
        const img = new Image();
        img.src = fullResDataUrl;
        await new Promise((r) => (img.onload = r));
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, targetW, targetH);
        return canvas.toDataURL("image/jpeg", 0.95);
      }
      return fullResDataUrl;
    },
    []
  );

  const handleExport = useCallback(
    async (el: HTMLDivElement, id: string, index: number) => {
      setExporting(true);
      const size = IPHONE_SIZES[sizeIdx];
      try {
        const dataUrl = await captureSlide(el, size.w, size.h);
        await exportToServer(dataUrl, id, index, size.label);
        setExportStatus(`Exported ${index}-${id}.jpg`);
        setTimeout(() => setExportStatus(""), 2000);
      } catch (err) {
        console.error("Export failed:", err);
        setExportStatus(`Export failed: ${err}`);
        setTimeout(() => setExportStatus(""), 3000);
      } finally {
        setExporting(false);
      }
    },
    [sizeIdx, captureSlide, exportToServer]
  );

  const handleExportCurrentSize = useCallback(async () => {
    setExporting(true);
    const size = IPHONE_SIZES[sizeIdx];
    const els = document.querySelectorAll<HTMLDivElement>("[data-export-canvas]");
    setExportStatus(`Exporting ${size.label}...`);
    for (let i = 0; i < SLIDES.length; i++) {
      const el = els[i];
      if (!el) continue;
      try {
        const dataUrl = await captureSlide(el, size.w, size.h);
        await exportToServer(dataUrl, SLIDES[i].id, i + 1, size.label);
        await new Promise((r) => setTimeout(r, 300));
      } catch (err) {
        console.error(`Export failed for slide ${i}:`, err);
      }
    }
    setExportStatus(`Exported ${size.label}!`);
    setTimeout(() => setExportStatus(""), 2000);
    setExporting(false);
  }, [sizeIdx, captureSlide, exportToServer]);

  const handleExportAll = useCallback(async () => {
    setExporting(true);
    const els = document.querySelectorAll<HTMLDivElement>("[data-export-canvas]");
    for (let s = 0; s < IPHONE_SIZES.length; s++) {
      const size = IPHONE_SIZES[s];
      setExportStatus(`Exporting ${size.label} (${s + 1}/${IPHONE_SIZES.length})...`);
      for (let i = 0; i < SLIDES.length; i++) {
        const el = els[i];
        if (!el) continue;
        try {
          const dataUrl = await captureSlide(el, size.w, size.h);
          await exportToServer(dataUrl, SLIDES[i].id, i + 1, size.label);
          await new Promise((r) => setTimeout(r, 300));
        } catch (err) {
          console.error(`Export failed for slide ${i}:`, err);
        }
      }
    }
    setExportStatus("All sizes exported!");
    setTimeout(() => setExportStatus(""), 3000);
    setExporting(false);
  }, [captureSlide, exportToServer]);

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-8 sticky top-0 bg-white z-50 py-4 border-b">
        <h1 className="text-lg font-bold">Callus Screenshots</h1>

        {/* Size selector */}
        <div className="flex gap-1">
          {IPHONE_SIZES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setSizeIdx(i)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                sizeIdx === i
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.label} ({s.w}×{s.h})
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {exportStatus && (
            <span className="text-xs text-gray-500">{exportStatus}</span>
          )}
          <button
            onClick={handleExportCurrentSize}
            disabled={exporting}
            className="text-sm px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            {exporting ? "Exporting..." : `Export ${IPHONE_SIZES[sizeIdx].label}`}
          </button>
          <button
            onClick={handleExportAll}
            disabled={exporting}
            className="text-sm px-4 py-2 text-white rounded-md disabled:opacity-50 transition-colors"
            style={{ backgroundColor: ACCENT }}
          >
            {exporting ? "Exporting..." : "Export All Sizes"}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-8 max-w-6xl mx-auto grid-cols-2 lg:grid-cols-3">
        {SLIDES.map((slide, i) => (
          <ScreenshotPreview
            key={slide.id}
            slide={slide}
            index={i + 1}
            onExport={handleExport}
          />
        ))}
      </div>

      {/* Visual feedback toolbar (dev only) — annotate a slide, then ask the
          agent to read pending annotations via the agentation MCP server. */}
      {process.env.NODE_ENV === "development" && (
        <Agentation endpoint="http://localhost:4747" />
      )}
    </div>
  );
}
