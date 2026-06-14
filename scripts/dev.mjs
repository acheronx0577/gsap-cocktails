import { spawn } from "node:child_process";

const WHITE = (text) => `\x1b[38;2;255;255;255m${text}\x1b[39m`;
const DIM = (text) => `\x1b[2m${text}\x1b[22m`;
const BOLD = (text) => `\x1b[1m${text}\x1b[22m`;
const GREEN = (text) => `\x1b[38;2;62;163;75m${text}\x1b[39m`;
const RED = (text) => `\x1b[38;2;214;75;75m${text}\x1b[39m`;
const AMBER = (text) => `\x1b[38;2;214;168;74m${text}\x1b[39m`;
const UNDERLINE = (text) => `\x1b[4m${text}\x1b[24m`;
/** Convex logo colors — purple / red / gold (tech-icon-markup + Simple Icons). */
const CONVEX_GRADIENT_STOPS = [
  [141, 38, 118],
  [238, 52, 47],
  [243, 176, 28],
];

function lerpChannel(from, to, t) {
  return Math.round(from + (to - from) * t);
}

function lerpRgb(from, to, t) {
  return [
    lerpChannel(from[0], to[0], t),
    lerpChannel(from[1], to[1], t),
    lerpChannel(from[2], to[2], t),
  ];
}

function sampleConvexGradient(t) {
  const [purple, red, gold] = CONVEX_GRADIENT_STOPS;
  if (t <= 0.5) {
    return lerpRgb(purple, red, t * 2);
  }
  return lerpRgb(red, gold, (t - 0.5) * 2);
}

function rgbFg(rgb, text) {
  const [r, g, b] = rgb;
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[39m`;
}

/** Single ▌ tinted with a multi-stop blend of the logo gradient. */
function convexGradientBar() {
  const samples = [0, 0.18, 0.36, 0.5, 0.64, 0.82, 1].map((t) =>
    sampleConvexGradient(t),
  );
  const rgb = [0, 1, 2].map((channel) =>
    Math.round(
      samples.reduce((sum, color) => sum + color[channel], 0) / samples.length,
    ),
  );
  return rgbFg(rgb, "▌");
}

function convexGradientText(text, { bold = false } = {}) {
  const chars = [...text];
  const open = bold ? "\x1b[1m" : "";
  const close = bold ? "\x1b[22m" : "";
  if (chars.length === 0) {
    return "";
  }
  if (chars.length === 1) {
    return `${open}${rgbFg(sampleConvexGradient(0.5), chars[0])}${close}`;
  }
  return chars
    .map((char, index) => {
      const t = index / (chars.length - 1);
      return `${open}${rgbFg(sampleConvexGradient(t), char)}${close}`;
    })
    .join("");
}

const NEXT_BAR_STOPS = [
  [255, 255, 255],
  [228, 228, 230],
  [168, 168, 172],
];

function sampleNextBarGradient(t) {
  const [white, lightGrey, midGrey] = NEXT_BAR_STOPS;
  if (t <= 0.5) {
    return lerpRgb(white, lightGrey, t * 2);
  }
  return lerpRgb(lightGrey, midGrey, (t - 0.5) * 2);
}

/** Single ▌ — white → light grey → mid grey blend (matches Next.js pill tone). */
function nextGradientBar() {
  const samples = [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1].map((t) =>
    sampleNextBarGradient(t),
  );
  const rgb = [0, 1, 2].map((channel) =>
    Math.round(
      samples.reduce((sum, color) => sum + color[channel], 0) / samples.length,
    ),
  );
  return rgbFg(rgb, "▌");
}

const NEXT_BRAND = (text) => `\x1b[38;2;255;255;255m${text}\x1b[39m`;
const NEXT_ACCENT = NEXT_BRAND;
const NEXT_BAR = nextGradientBar();
const CONVEX_BAR = convexGradientBar();
const ERROR_BAR = RED("▌");
const SUCCESS_BAR = GREEN("▌");
const FAREWELL = (text) => `\x1b[38;2;168;155;210m${text}\x1b[39m`;
const FAREWELL_BAR = FAREWELL("▌");
const STARTUP = (text) => `\x1b[38;2;120;176;220m${text}\x1b[39m`;
const REQUESTS = (text) => `\x1b[38;2;196;168;108m${text}\x1b[39m`;
const ANSI_RE = /\x1b\[[0-9;?]*[ -/]*[@-~]/g;
const TAG_STYLES = {
  next: NEXT_BRAND,
};

function tagFor(name) {
  if (name === "convex") {
    return convexGradientText("[convex]");
  }
  return (TAG_STYLES[name] ?? WHITE)(`[${name}]`);
}

function makeBadge(bg, fg, label) {
  const [bgR, bgG, bgB] = bg;
  const [fgR, fgG, fgB] = fg;
  return `\x1b[48;2;${bgR};${bgG};${bgB}m\x1b[38;2;${fgR};${fgG};${fgB}m\x1b[1m ${label} \x1b[22m\x1b[49m\x1b[39m`;
}

function gradientFg(rgb, text) {
  const [r, g, b] = rgb;
  return `\x1b[38;2;${r};${g};${b}m${text}`;
}

/** Dark pill + full-strength logo gradient (no grey wash, no single flat fg). */
function convexBrandBadge(label, bg) {
  const [bgR, bgG, bgB] = bg;
  const chars = [...label];
  let inner = "";
  if (chars.length === 1) {
    inner = `\x1b[1m${gradientFg(sampleConvexGradient(0.5), chars[0])}\x1b[22m`;
  } else {
    inner = chars
      .map((char, index) => {
        const t = index / (chars.length - 1);
        return `\x1b[1m${gradientFg(sampleConvexGradient(t), char)}\x1b[22m`;
      })
      .join("");
  }
  return `\x1b[48;2;${bgR};${bgG};${bgB}m ${inner} \x1b[49m\x1b[39m`;
}

/** Pill background — dark charcoal, shared by Convex head + link labels. */
const CONVEX_PILL_BG = [46, 46, 48];

function convexHeadBadge() {
  return convexBrandBadge("Convex", CONVEX_PILL_BG);
}

function convexLinkBadge(label) {
  return convexBrandBadge(label, CONVEX_PILL_BG);
}

const DEV_BADGE = makeBadge([210, 236, 187], [43, 101, 54], "Development");
/** Next pills — shared grey container + soft white-grey label. */
const NEXT_PILL_BG = [46, 46, 48];
const NEXT_PILL_FG = [228, 228, 230];

function nextLinkBadge(label) {
  return makeBadge(NEXT_PILL_BG, NEXT_PILL_FG, label);
}

const NEXT_HEAD_BADGE = nextLinkBadge("Next.js");
const NEXT_LOCAL_BADGE = nextLinkBadge("local");
const NEXT_NETWORK_BADGE = nextLinkBadge("network");
const NEXT_ENV_BADGE = makeBadge([236, 228, 210], [102, 72, 38], "env");
const CONVEX_CLOUD_BADGE = convexLinkBadge("cloud");
const CONVEX_DASHBOARD_BADGE = convexLinkBadge("dashboard");

const LINK_BADGES = {
  local: NEXT_LOCAL_BADGE,
  network: NEXT_NETWORK_BADGE,
  env: NEXT_ENV_BADGE,
  cloud: CONVEX_CLOUD_BADGE,
  dashboard: CONVEX_DASHBOARD_BADGE,
};

const LABEL_WIDTH = 9;

function stripAnsi(text) {
  return text.replace(ANSI_RE, "");
}

const CONVEX_NAV_HINT_RE = /↑↓ navigate • ⏎ select/g;

function collapseCarriageReturns(text) {
  return text
    .split("\n")
    .map((line) => {
      const idx = line.lastIndexOf("\r");
      return idx === -1 ? line : line.slice(idx + 1);
    })
    .join("\n");
}

function stripConvexLead(text) {
  return stripAnsi(text).replace(/^▌\s*/, "").trim();
}

function normalizeConvexPlain(plain) {
  return stripConvexLead(plain)
    .replace(CONVEX_NAV_HINT_RE, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseConvexCompletedPrompt(plain) {
  const text = normalizeConvexPlain(plain);
  if (!/✔/.test(text)) {
    return null;
  }

  const body = text.slice(text.indexOf("✔") + 1).trim();

  if (/\bcloud deployment\b/i.test(body)) {
    return { label: "Deployment", value: "cloud" };
  }
  if (/\blocal deployment\b/i.test(body)) {
    return { label: "Deployment", value: "local (beta)" };
  }
  if (/Set up Convex AI files/i.test(body)) {
    return {
      label: "Convex AI files",
      value: /\bYes\b/i.test(body) ? "enabled" : "skipped",
    };
  }
  if (/^Created project /i.test(body)) {
    return null;
  }
  if (/^Provisioned a dev deployment/i.test(body)) {
    return null;
  }
  if (/Skills installed/i.test(body)) {
    return null;
  }
  if (/\swritten$/i.test(body)) {
    return null;
  }
  if (/Convex functions ready/i.test(body)) {
    return null;
  }
  if (/Finished bundling|Code pushed/i.test(body)) {
    return null;
  }

  if (/\?/.test(body)) {
    const questionMatch = body.match(/^(.+?\?)\s*(.+)$/);
    if (questionMatch) {
      let label = questionMatch[1].replace(/\?+$/, "").trim();
      if (label.length > 42) {
        label = label.split("?")[0].trim();
      }
      return { label, value: questionMatch[2].trim() };
    }
  }

  const colonMatch = body.match(/^([^:?]+?):\s*(.+)$/);
  if (
    colonMatch &&
    !/^\d{1,2}:\d{2}/.test(colonMatch[1]) &&
    !/^\d{1,2}:\d{2}/.test(body)
  ) {
    return { label: colonMatch[1].trim(), value: colonMatch[2].trim() };
  }

  return null;
}

function formatConvexSetupAnswer(plain) {
  const parsed = parseConvexCompletedPrompt(plain);
  if (!parsed) {
    return null;
  }

  const label =
    parsed.label.length > 34 ? `${parsed.label.slice(0, 31)}…` : parsed.label;

  return convexRow(
    `${GREEN("✔")} ${DIM(label)} ${DIM("→")} ${WHITE(parsed.value)}`,
    { success: true },
  );
}

function shouldSuppressConvexLine(plain) {
  const text = normalizeConvexPlain(plain);
  if (!text) {
    return true;
  }
  if (/^❯/.test(text)) {
    return true;
  }
  if (
    /^(create a new project|choose an existing project|cloud deployment|local deployment)/i.test(
      text,
    )
  ) {
    return true;
  }
  if (/^\?/.test(text) && !/✔/.test(text)) {
    return true;
  }
  if (/^Creating \.+$/i.test(text)) {
    return true;
  }
  if (/^Installing Convex agent skills/i.test(text)) {
    return true;
  }
  if (
    /^(Write your Convex functions|Give us feedback|View the Convex dashboard at)/i.test(
      text,
    )
  ) {
    return true;
  }
  if (
    /^(client URL as|HTTP actions URL as|name as CONVEX_DEPLOYMENT|to \.env\.local)/i.test(
      text,
    )
  ) {
    return true;
  }
  if (/^If you're running into errors with other tools watching/i.test(text)) {
    return true;
  }
  if (/^override the temporary directory|^Be sure to pick a temporary directory|^location with the CONVEX_TMPDIR/i.test(text)) {
    return true;
  }
  return false;
}

function formatConvexFilesystemWarning(plain) {
  if (!/Temporary directory .* different filesystems/i.test(normalizeConvexPlain(plain))) {
    return null;
  }

  return convexRow(
    `${AMBER("!")} ${DIM("Convex temp dir is on another drive — set CONVEX_TMPDIR if file watchers fail")}`,
  );
}

function formatConvexDeploymentModern(team, slug) {
  convexDevRowEmitted = true;
  flushConvexBootLinksAfterEmit = true;

  return [
    convexRow(
      `${DEV_BADGE}  ${DIM(`${team}:`)}${BOLD(slug)}${DIM(" (dev)")}`,
    ),
  ];
}

function formatConvexDeploymentShort(project, ref, dashUrl) {
  if (dashUrl) {
    pendingConvexDashboardUrl = dashUrl;
  }
  convexDevRowEmitted = true;
  flushConvexBootLinksAfterEmit = true;

  return [
    convexRow(
      `${DEV_BADGE}  ${DIM(`${project}:`)}${BOLD(ref)}${DIM(" (dev)")}`,
    ),
  ];
}

function formatConvexSimpleLink(label, url) {
  return convexRow(arrowLink(label, UNDERLINE(url)));
}

function labelCell(label) {
  const pad = Math.max(1, LABEL_WIDTH - label.length);
  return `${DIM(label)}${" ".repeat(pad)}`;
}

function branchMark() {
  return `${DIM("└")}${DIM("→")}`;
}

function branchLink(value) {
  return `${branchMark()} ${value}`;
}

function badgeLink(badge, value) {
  return `${branchMark()} ${badge}  ${value}`;
}

function labeledLink(label, value) {
  const badge = LINK_BADGES[label];
  if (badge) {
    return badgeLink(badge, value);
  }
  return arrowLink(label, value);
}

function arrowLink(label, value) {
  return `${branchMark()} ${labelCell(label)}${value}`;
}

function okLink(label, value) {
  return `${GREEN("✔")} ${label} ${DIM("-")} ${value}`;
}

function statusTone(status) {
  if (status.startsWith("2") || status.startsWith("3")) {
    return GREEN(status);
  }
  if (status.startsWith("4")) {
    return AMBER(status);
  }
  if (status.startsWith("5")) {
    return RED(status);
  }
  return WHITE(status);
}

function barFor(sourceName, { error = false, success = false } = {}) {
  if (error) {
    return ERROR_BAR;
  }
  if (success) {
    return SUCCESS_BAR;
  }
  return sourceName === "next" ? NEXT_BAR : CONVEX_BAR;
}

function convexErrorDetailRow(message) {
  return `${ERROR_BAR}    ${RED(message)}`;
}

function isLikelyConvexErrorDetail(plain) {
  return /^(invalid|error|failed|could not|unexpected|cannot)/i.test(plain);
}

function isConvexErrorHead(plain) {
  return /^✖/.test(plain);
}

function isConvexErrorBufferPart(plain) {
  return isConvexErrorHead(plain) || isLikelyConvexErrorDetail(plain);
}

function classifyConvexError(buffer) {
  const headLine = buffer.find(isConvexErrorHead) ?? "";
  const headline = headLine.replace(/^✖\s*/, "").trim();
  const details = buffer.filter((line) => !isConvexErrorHead(line));
  const primaryDetail = details[0] ?? "";

  let error = "deployment error";
  if (/push/i.test(headline)) {
    error = "push error";
  } else if (/bundl/i.test(headline)) {
    error = "bundle error";
  } else if (/schema/i.test(headline) || /schema/i.test(primaryDetail)) {
    error = "schema error";
  }

  const cause =
    primaryDetail ||
    headline.replace(/^Error(?: while [^:]+)?:\s*/i, "") ||
    headline ||
    "deployment failed";

  return {
    error,
    cause,
    headline,
    extras: details.slice(1),
  };
}

function formatConvexErrorBlock(buffer) {
  const { error, cause, headline, extras } = classifyConvexError(buffer);
  const rows = [
    convexRow(`${RED(error)} ${DIM("·")} ${RED(cause)}`, { error: true }),
  ];
  if (headline) {
    rows.push(
      convexRow(branchLink(`${RED("✖")} ${RED(headline)}`), { error: true }),
    );
  }
  for (const line of extras) {
    rows.push(convexErrorDetailRow(line));
  }
  return rows;
}

function nextErrorDetailRow(text) {
  return `${ERROR_BAR}    ${text}`;
}

function isNextErrorHead(plain) {
  return /^⨯/.test(plain);
}

function isNextErrorDetail(plain) {
  return /^(Module not found:|Error:|Syntax error:|Type error:|Caused by:|Import trace for requested module:)/i.test(
    plain,
  );
}

function isNextErrorPart(plain) {
  return isNextErrorHead(plain) || isNextErrorDetail(plain);
}

function classifyNextCompileError(buffer) {
  const headLine = buffer.find(isNextErrorHead) ?? "";
  const location = headLine.replace(/^⨯\s*/, "").trim();
  const details = buffer.filter((line) => !isNextErrorHead(line));

  const moduleLine = details.find((line) => /^Module not found:/i.test(line));
  if (moduleLine) {
    return {
      error: "module not found",
      cause: moduleLine.replace(/^Module not found:\s*/i, ""),
      location,
      extras: details.filter(
        (line) =>
          line !== moduleLine && !/^Error:\s*Failed to compile/i.test(line),
      ),
    };
  }

  const syntaxLine = details.find((line) => /^Syntax error:/i.test(line));
  if (syntaxLine) {
    return {
      error: "syntax error",
      cause: syntaxLine.replace(/^Syntax error:\s*/i, ""),
      location,
      extras: details.filter((line) => line !== syntaxLine),
    };
  }

  const typeLine = details.find((line) => /^Type error:/i.test(line));
  if (typeLine) {
    return {
      error: "type error",
      cause: typeLine.replace(/^Type error:\s*/i, ""),
      location,
      extras: details.filter((line) => line !== typeLine),
    };
  }

  const errorLine = details.find((line) => /^Error:/i.test(line));
  return {
    error: "compile error",
    cause:
      errorLine?.replace(/^Error:\s*/i, "") ?? (location || "build failed"),
    location: errorLine ? location : "",
    extras: details.filter((line) => line !== errorLine),
  };
}

function formatNextErrorBlock(buffer) {
  const { error, cause, location, extras } = classifyNextCompileError(buffer);
  const rows = [
    nextRow(`${RED(error)} ${DIM("·")} ${RED(cause)}`, { error: true }),
  ];
  if (location) {
    rows.push(
      nextRow(branchLink(`${RED("⨯")} ${RED(location)}`), { error: true }),
    );
  }
  for (const line of extras) {
    rows.push(nextErrorDetailRow(RED(line)));
  }
  return rows;
}

function nextWarningDetailRow(text) {
  return `${NEXT_BAR}    ${text}`;
}

function formatReadMoreTail(text) {
  const match = text.match(/^(Read more:\s+)(\S+)$/i);
  if (match) {
    return `${AMBER(match[1])}${UNDERLINE(match[2])}`;
  }
  return AMBER(text);
}

function splitNextWarningBody(body) {
  const readMoreIdx = body.search(/\sRead more:\s/i);
  if (readMoreIdx !== -1) {
    return [
      body.slice(0, readMoreIdx).trim(),
      body.slice(readMoreIdx).trim(),
    ];
  }

  if (body.length <= 72) {
    return [body];
  }

  const sentenceEnd = body.search(/\.\s+/);
  if (sentenceEnd !== -1 && sentenceEnd < body.length - 1) {
    return [
      body.slice(0, sentenceEnd + 1).trim(),
      body.slice(sentenceEnd + 1).trim(),
    ];
  }

  return [body];
}

function formatNextWarningRows(plain) {
  const parts = splitNextWarningBody(plain.replace(/^⚠\s*/, ""));
  const rows = [nextRow(`${AMBER("⚠")} ${AMBER(parts[0])}`)];
  for (const part of parts.slice(1)) {
    rows.push(nextWarningDetailRow(formatReadMoreTail(part)));
  }
  return rows;
}

function stripBrowserPrefix(plain) {
  return plain.replace(/^\[browser\]\s*/, "");
}

function isKnownNextBootLine(trimmed) {
  return /^-\s+(Local|Network|Environments):/i.test(trimmed);
}

function isHydrationTreeLine(plain) {
  if (!plain.trim()) {
    return true;
  }

  const body = stripBrowserPrefix(plain);
  const trimmed = body.trim();
  if (!trimmed) {
    return true;
  }
  if (isKnownNextBootLine(trimmed)) {
    return false;
  }
  if (/^A tree hydrated/i.test(trimmed)) {
    return true;
  }
  if (/^https:\/\/react\.dev\/link\/hydration-mismatch/i.test(trimmed)) {
    return true;
  }
  if (
    /^(\.{3}|…|It can also happen|This won't be patched)/i.test(trimmed) ||
    /^- A server\/client branch|^Variable input such as|^Date formatting|^External changing|^Invalid HTML tag/i.test(
      trimmed,
    )
  ) {
    return true;
  }
  if (/^</.test(trimmed) || /^[A-Z][A-Za-z0-9]*>/.test(trimmed)) {
    return true;
  }
  if (/^>/.test(trimmed)) {
    return true;
  }
  if (/^[-+]\s/.test(trimmed)) {
    return true;
  }
  if (
    /data-cursor-ref=|className=|visible_text:|component:|dom_path:|aria-/i.test(
      trimmed,
    )
  ) {
    return true;
  }
  if (/^\s+[-+.<]/.test(body)) {
    return true;
  }
  if (/^\s+\.\.\./.test(body)) {
    return true;
  }

  return false;
}

function formatHydrationMismatchSummary(buffer) {
  const full = buffer.join("\n");
  const cursorRef = /data-cursor-ref/.test(full);
  const nodeCount = (full.match(/<[A-Za-z][A-Za-z0-9]*/g) ?? []).length;
  const hint = cursorRef
    ? "Cursor preview data-cursor-ref — safe to ignore in Glass"
    : "SSR/client HTML differ — check window, Date, or random values";

  const rows = [
    nextRow(
      `${AMBER("⚠")} ${AMBER("hydration")} ${DIM("·")} ${DIM(hint)}${nodeCount ? DIM(` · ${nodeCount} nodes`) : ""}`,
    ),
  ];
  if (!cursorRef) {
    rows.push(
      nextWarningDetailRow(UNDERLINE("https://react.dev/link/hydration-mismatch")),
    );
  }
  return rows;
}

function isLcpImageWarning(plain) {
  return (
    /\[browser\].*Largest Contentful Paint/i.test(plain) ||
    /Please add the [`']loading="eager"[`']/i.test(plain)
  );
}

function isLcpContinuationLine(plain) {
  const trimmed = stripBrowserPrefix(plain).trim();
  if (!trimmed) {
    return false;
  }
  return (
    /^property if this image/i.test(trimmed) ||
    /^Read more: https:\/\/nextjs\.org\/docs\/app\/api-reference\/components\/image/i.test(
      trimmed,
    ) ||
    (/Largest Contentful Paint/i.test(trimmed) && /loading="eager"/i.test(trimmed))
  );
}

function formatLcpWarningRows(input) {
  const body = (Array.isArray(input) ? input : [input])
    .map((line) => stripBrowserPrefix(line))
    .join(" ");
  const srcMatch =
    body.match(/src\s+["']([^"']+)["']/i) ?? body.match(/src "([^"]+)"/i);
  const src = srcMatch?.[1] ?? "image";
  const file = src.split("/").pop() ?? src;

  return [
    nextRow(
      `${AMBER("⚠")} ${AMBER("LCP image")} ${DIM("·")} ${file} ${DIM("·")} add priority or loading='eager'`,
    ),
  ];
}

function isNextBrowserMisc(plain) {
  return /^\[browser\]\s+/.test(plain);
}

function formatNextBrowserMiscRows(plain) {
  const body = stripBrowserPrefix(plain).trim();
  if (!body) {
    return [];
  }
  const clipped = body.length > 88 ? `${body.slice(0, 85)}…` : body;
  return [nextRow(`${DIM("browser")} ${DIM("·")} ${clipped}`)];
}

function formatNextCompileStart(plain) {
  const routeMatch = plain.match(/^○ Compiling(?:\s+(\S+))?(.*)$/);
  const route = routeMatch?.[1];
  const tail = routeMatch?.[2]?.trim() ?? "";
  const detail = route
    ? `${DIM("○")} ${route}${tail ? ` ${DIM(tail)}` : ""}`
    : `${DIM("○")} ${DIM("rebuilding …")}`;

  return [nextHead(BOLD("COMPILE")), nextRow(branchLink(detail))];
}

function parseNextCompiledLine(plain) {
  const genericMatch = plain.match(/^✓ Compiled in (\S+)$/);
  if (genericMatch) {
    return { kind: "hmr", duration: genericMatch[1] };
  }

  const routeMatch = plain.match(
    /^✓ Compiled (\S+) in (\S+)(?: \((\d+) modules\))?$/,
  );
  if (routeMatch) {
    return {
      kind: "route",
      route: routeMatch[1],
      duration: routeMatch[2],
      modules: routeMatch[3],
    };
  }

  return null;
}

function formatNextCompileDone(plain) {
  const parsed = parseNextCompiledLine(plain);
  if (!parsed) {
    return [
      nextHead(BOLD("COMPILE")),
      nextRow(
        branchLink(`${GREEN("✓")} ${plain.replace(/^✓\s*/, "")}`),
        { success: true },
      ),
    ];
  }

  let detail;
  if (parsed.kind === "hmr") {
    detail = `${okLink("hot reload", parsed.duration)} ${DIM("·")} ${DIM("file change")}`;
  } else {
    const modulesPart = parsed.modules
      ? ` ${DIM("·")} ${DIM(`${parsed.modules} modules`)}`
      : "";
    detail = `${GREEN("✔")} ${parsed.route} ${DIM("·")} ${parsed.duration}${modulesPart}`;
  }

  return [
    nextHead(BOLD("COMPILE")),
    nextRow(branchLink(detail), { success: true }),
  ];
}

function formatNextPlainLine(plain) {
  if (/^⚠/.test(plain)) {
    return formatNextWarningRows(plain);
  }
  if (/^○ Compiling/.test(plain)) {
    return formatNextCompileStart(plain);
  }
  if (/^✓ Compiled/.test(plain)) {
    return formatNextCompileDone(plain);
  }
  return nextRow(plain);
}

function stripConvexTimestamp(text) {
  return text
    .replace(/^\d{1,2}:\d{2}:\d{2}(?:\.\d+)?(?:\s*[AP]M)?\s+/i, "")
    .trim();
}

function convexWaitingText(body) {
  const plain = body.trim().replace(/\.+$/, "");

  if (/^preparing(?: convex functions| to watch files)?$/i.test(plain)) {
    return "Preparing ...";
  }
  if (/^bundling/i.test(plain)) {
    return "Bundling ...";
  }
  if (/^pushing/i.test(plain)) {
    return "Pushing ...";
  }

  const head = plain.split(/\s+/)[0] ?? "Working";
  return `${head.charAt(0).toUpperCase()}${head.slice(1)} ...`;
}

function convexWaitingRow(body) {
  return convexRow(DIM(convexWaitingText(body)));
}

function convexSuccessRow(body) {
  const plain = stripConvexTimestamp(body.trim());
  const durationMatch = plain.match(/\(([^)]+)\)\s*$/);
  const duration = durationMatch?.[1];
  const message = (
    durationMatch ? plain.slice(0, durationMatch.index) : plain
  )
    .trim()
    .replace(/!+$/, "");

  let label = message;
  if (/^convex functions ready$/i.test(message)) {
    label = "function ready";
  } else if (/^finished bundling/i.test(message)) {
    label = "Bundling Complete";
  } else if (/^code pushed/i.test(message)) {
    label = "Code Pushed";
  } else if (message) {
    label = message.charAt(0).toUpperCase() + message.slice(1);
  } else {
    label = "Ready";
  }

  const checkLine = duration
    ? `${GREEN("✔")} ${label} ${DIM("-")} ${duration}`
    : `${GREEN("✔")} ${label}`;

  return convexRow(branchLink(checkLine), { success: true });
}

function nextHead(text) {
  return `${NEXT_BAR} ${text}`;
}

function nextRow(text, { error = false, success = false } = {}) {
  return `${barFor("next", { error, success })}  ${text}`;
}

function convexHead(text) {
  return `${CONVEX_BAR} ${text}`;
}

function convexRow(text, { error = false, success = false } = {}) {
  return `${barFor("convex", { error, success })}  ${text}`;
}

function devTermWidth() {
  return Math.max(60, process.stdout.columns || 100);
}

function wrapDevBody(line, bar, sourceName) {
  const plain = stripAnsi(line);
  if (/https?:\/\//.test(plain)) {
    return [line];
  }

  const maxPlain = Math.max(
    48,
    devTermWidth() - stripAnsi(tagFor(sourceName)).length - 2,
  );

  if (plain.length <= maxPlain) {
    return [line];
  }

  const barPlain = stripAnsi(bar);
  const afterBar = plain.startsWith(barPlain)
    ? plain.slice(barPlain.length)
    : plain.startsWith("▌")
      ? plain.slice(1)
      : plain;
  const indent = afterBar.match(/^(\s*)/)?.[1] ?? " ";
  const rowPrefix = `${bar}${indent}`;
  const body = afterBar.trimStart();
  const words = body.split(/\s+/);
  const rows = [];
  let chunk = [];
  const budget = maxPlain - stripAnsi(rowPrefix).length;

  const pushChunk = () => {
    if (!chunk.length) {
      return;
    }
    rows.push(`${rowPrefix}${chunk.join(" ")}`);
    chunk = [];
  };

  for (const word of words) {
    if (/^https?:\/\//i.test(word)) {
      pushChunk();
      rows.push(`${rowPrefix}${word}`);
      continue;
    }

    if (word.length > budget) {
      pushChunk();
      for (let i = 0; i < word.length; i += budget) {
        rows.push(`${rowPrefix}${word.slice(i, i + budget)}`);
      }
      continue;
    }

    const nextLen =
      chunk.join(" ").length + (chunk.length ? 1 : 0) + word.length;
    if (chunk.length && nextLen > budget) {
      pushChunk();
      chunk = [word];
    } else {
      chunk.push(word);
    }
  }

  if (chunk.length) {
    rows.push(`${rowPrefix}${chunk.join(" ")}`);
  }

  return rows.length ? rows : [line];
}

function wrapConvexBody(line, { error = false, success = false } = {}) {
  return wrapDevBody(line, barFor("convex", { error, success }), "convex");
}

function formatConvexDeployment(team, project, ref, dashUrl) {
  if (dashUrl) {
    pendingConvexDashboardUrl = dashUrl;
  }
  convexDevRowEmitted = true;
  flushConvexBootLinksAfterEmit = true;

  return [
    convexRow(
      `${DEV_BADGE}  ${DIM(`${team}/${project}:`)}${BOLD(ref)}${DIM(" (dev)")}`,
    ),
  ];
}

function emitConvexBootLinks(prefix = tagFor("convex"), { force = false } = {}) {
  if (!convexDevRowEmitted && !force) {
    return;
  }

  const rows = [];

  if (pendingConvexCloudUrl) {
    rows.push(formatConvexSimpleLink("cloud", pendingConvexCloudUrl));
    pendingConvexCloudUrl = null;
  } else if (pendingConvexDashboardUrl && !force) {
    return;
  }

  if (pendingConvexDashboardUrl) {
    rows.push(formatConvexSimpleLink("dashboard", pendingConvexDashboardUrl));
    pendingConvexDashboardUrl = null;
  }

  if (!rows.length) {
    return;
  }

  emitFormatted("convex", prefix, flattenConvexFormatted(rows));
}

function wrapNextBody(line, { error = false, success = false } = {}) {
  return wrapDevBody(line, barFor("next", { error, success }), "next");
}

function formatNextRequest(method, path, status, duration, breakdown) {
  const statusText = statusTone(status);
  return [
    nextHead(BOLD(method)),
    nextRow(
      branchLink(
        `${path} ${statusText} ${DIM("·")} ${duration} ${DIM(breakdown)}`,
      ),
    ),
  ];
}

const NEXT_REQUEST_RE =
  /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)\s+(\d{3})\s+in\s+(\S+)\s+(\(.+\))$/;

const REQUEST_LOG_MODES = new Set(["quiet", "normal", "verbose"]);
const REQUEST_COLLAPSE_MS_VERBOSE = 800;
const REQUEST_COLLAPSE_MS_NORMAL = 1500;
const REQUEST_SLOW_MS = 800;
const REQUEST_FAST_HIDE_MS = 300;

/** @type {"quiet" | "normal" | "verbose"} */
let requestLogMode = "normal";

function resolveRequestLogMode(argv) {
  for (const arg of argv) {
    if (arg.startsWith("--requests=")) {
      const mode = arg.slice("--requests=".length).toLowerCase();
      if (REQUEST_LOG_MODES.has(mode)) {
        return mode;
      }
    }
  }
  const envMode = process.env.DEV_REQUEST_LOG?.toLowerCase();
  if (envMode && REQUEST_LOG_MODES.has(envMode)) {
    return envMode;
  }
  return "normal";
}

function requestCollapseMs() {
  return requestLogMode === "verbose"
    ? REQUEST_COLLAPSE_MS_VERBOSE
    : REQUEST_COLLAPSE_MS_NORMAL;
}

function requestBreakdownForBurst(burst) {
  if (requestLogMode !== "verbose") {
    const maxMs = burst.maxMs ?? parseRequestDurationMs(burst.lastDuration);
    if (maxMs == null || maxMs < REQUEST_SLOW_MS) {
      return "";
    }
  }
  return burst.lastBreakdown;
}

function shouldEmitRequestBurst(burst) {
  if (requestLogMode === "quiet") {
    return false;
  }
  if (requestLogMode === "verbose") {
    return true;
  }

  const status = burst.status;
  if (status.startsWith("4") || status.startsWith("5")) {
    return true;
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(burst.method)) {
    return true;
  }

  const maxMs = burst.maxMs ?? parseRequestDurationMs(burst.lastDuration);
  if (maxMs == null) {
    return true;
  }
  if (maxMs >= REQUEST_SLOW_MS) {
    return true;
  }
  if (burst.method === "GET" && burst.path === "/api/contact" && maxMs < 500) {
    return false;
  }
  return maxMs >= REQUEST_FAST_HIDE_MS;
}

function requestSlowTag(burst) {
  const maxMs = burst.maxMs ?? parseRequestDurationMs(burst.lastDuration);
  if (maxMs != null && maxMs >= REQUEST_SLOW_MS) {
    return ` ${AMBER("slow")}`;
  }
  return "";
}

/** @type {{ key: string; method: string; path: string; status: string; count: number; lastDuration: string; lastBreakdown: string; minMs: number | null; maxMs: number | null; prefix: string } | null} */
let nextRequestBurst = null;
/** @type {ReturnType<typeof setTimeout> | null} */
let nextRequestBurstTimer = null;

function parseRequestDurationMs(duration) {
  const match = String(duration).match(/^([\d.]+)(ms|s)$/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  return match[2] === "s" ? Math.round(value * 1000) : Math.round(value);
}

function formatDurationRange(minMs, maxMs, fallback) {
  if (minMs == null || maxMs == null) return fallback;
  if (minMs === maxMs) return `${minMs}ms`;
  return `${minMs}–${maxMs}ms`;
}

function formatNextRequestBurst(burst) {
  const statusText = statusTone(burst.status);
  const duration = formatDurationRange(
    burst.minMs,
    burst.maxMs,
    burst.lastDuration,
  );
  const countSuffix = burst.count > 1 ? ` ${DIM("×")}${burst.count}` : "";
  const breakdown = requestBreakdownForBurst(burst);
  const breakdownPart = breakdown ? ` ${DIM(breakdown)}` : "";
  const slowTag = requestSlowTag(burst);

  if (requestLogMode === "verbose") {
    const head =
      burst.count > 1 ? BOLD(`${burst.method} ×${burst.count}`) : BOLD(burst.method);
    return [
      nextHead(head),
      nextRow(
        branchLink(
          `${burst.path} ${statusText} ${DIM("·")} ${duration}${breakdownPart}${slowTag}`,
        ),
      ),
    ];
  }

  const methodLabel = burst.count > 1 ? `${burst.method}${countSuffix}` : burst.method;
  return [
    nextRow(
      `${REQUESTS(methodLabel)} ${burst.path} ${statusText} ${DIM("·")} ${duration}${breakdownPart}${slowTag}`,
    ),
  ];
}

function flushNextRequestBurst() {
  if (!nextRequestBurst) return;
  const burst = nextRequestBurst;
  nextRequestBurst = null;
  if (nextRequestBurstTimer) {
    clearTimeout(nextRequestBurstTimer);
    nextRequestBurstTimer = null;
  }
  if (!shouldEmitRequestBurst(burst)) {
    return;
  }
  emitFormatted("next", burst.prefix, formatNextRequestBurst(burst));
}

function scheduleNextRequestLog(method, path, status, duration, breakdown, prefix) {
  const key = `${method} ${path} ${status}`;
  const ms = parseRequestDurationMs(duration);

  if (nextRequestBurst && nextRequestBurst.key === key) {
    nextRequestBurst.count += 1;
    nextRequestBurst.lastDuration = duration;
    nextRequestBurst.lastBreakdown = breakdown;
    if (ms != null) {
      nextRequestBurst.minMs =
        nextRequestBurst.minMs == null ? ms : Math.min(nextRequestBurst.minMs, ms);
      nextRequestBurst.maxMs =
        nextRequestBurst.maxMs == null ? ms : Math.max(nextRequestBurst.maxMs, ms);
    }
    if (nextRequestBurstTimer) clearTimeout(nextRequestBurstTimer);
    nextRequestBurstTimer = setTimeout(flushNextRequestBurst, requestCollapseMs());
    return;
  }

  flushNextRequestBurst();

  nextRequestBurst = {
    key,
    method,
    path,
    status,
    count: 1,
    lastDuration: duration,
    lastBreakdown: breakdown,
    minMs: ms,
    maxMs: ms,
    prefix,
  };
  nextRequestBurstTimer = setTimeout(flushNextRequestBurst, requestCollapseMs());
}

function flattenNextFormatted(formatted, { error = false, success = false } = {}) {
  const rows = Array.isArray(formatted) ? formatted : [formatted];
  return rows.flatMap((row) => wrapNextBody(row, { error, success }));
}

const NEXT_LINE_FORMATTERS = [
  [
    /^▲ Next\.js (.+)$/,
    ([, version]) => [
      nextHead(NEXT_HEAD_BADGE),
      nextRow(`${DEV_BADGE}  ${BOLD(version)}`),
    ],
  ],
  [/^- Local:\s+(\S+)/, ([, url]) => nextRow(labeledLink("local", UNDERLINE(url)))],
  [
    /^- Network:\s+(\S+)/,
    ([, url]) => nextRow(labeledLink("network", UNDERLINE(url))),
  ],
  [
    /^- Environments:\s+(.+)$/,
    ([, files]) => nextRow(labeledLink("env", files)),
  ],
  [
    /^✓ Ready in (.+)$/,
    ([, duration]) =>
      nextRow(branchLink(okLink("ready", duration)), { success: true }),
  ],
];

const CONVEX_LINE_FORMATTERS = [
  [
    /^Convex\s*$/,
    () => {
      convexBootInfoOpen = true;
      return convexHead(convexHeadBadge());
    },
  ],
  [
    /^Developing against deployment:$/,
    () => {
      convexBootInfoOpen = true;
      return convexHead(convexHeadBadge());
    },
  ],
  [
    /^Development\s+([\w-]+):([\S]+)\s+\(dev\)/,
    ([, team, slug]) => formatConvexDeploymentModern(team, slug),
  ],
  [
    /^└→\s+cloud\s+(\S+)/,
    ([, url]) => formatConvexSimpleLink("cloud", url),
  ],
  [
    /^└→\s+dashboard\s+(\S+)/,
    ([, url]) => formatConvexSimpleLink("dashboard", url),
  ],
  [
    /^└─\s+(\S+)/,
    ([, url]) => {
      pendingConvexCloudUrl = url;
      emitConvexBootLinks();
      return [];
    },
  ],
  [
    /^\[Development\]\s+([\w-]+):(\S+)\s+\(dev\)\s+\(dashboard:\s*(\S+)\)/,
    ([, project, ref, dashUrl]) =>
      formatConvexDeploymentShort(project, ref, dashUrl),
  ],
  [
    /^(?:\[Development\]|Development)\s+([\w-]+):([\w-]+):(\S+)\s+\(dev\)\s+\(dashboard:\s*(\S+)\)/,
    ([, team, project, ref, dashUrl]) =>
      formatConvexDeployment(team, project, ref, dashUrl),
  ],
  [
    /^(?:\[Development\]|Development)\s+([\w-]+):([\w-]+):(\S+)\s+\(dev\)\s+\(dashboard\)/,
    ([, team, project, ref]) =>
      formatConvexDeployment(team, project, ref, null),
  ],
  [
    /^✔\s+Created project (.+?), manage it at (\S+)/,
    ([, name, url]) => [
      convexRow(
        `${GREEN("✔")} ${DIM("project")} ${DIM("→")} ${WHITE(name)}`,
        { success: true },
      ),
      formatConvexSimpleLink("manage", url),
    ],
  ],
  [
    /^✔\s+Provisioned a dev deployment/i,
    () =>
      convexRow(
        `${GREEN("✔")} ${DIM("deployment")} ${DIM("→")} ${WHITE("provisioned")} ${DIM("(.env.local)")}`,
        { success: true },
      ),
  ],
  [
    /^✔\s+Skills installed$/i,
    () =>
      convexRow(
        `${GREEN("✔")} ${DIM("agent skills")} ${DIM("→")} ${WHITE("installed")}`,
        { success: true },
      ),
  ],
  [
    /^✔\s+(.+)\s+written$/i,
    ([, target]) =>
      convexRow(
        `${GREEN("✔")} ${DIM("write")} ${DIM("→")} ${WHITE(target.split(/[/\\]/).pop() ?? target)}`,
        { success: true },
      ),
  ],
];

/** @type {import("node:child_process").ChildProcess[]} */
const children = [];
let shuttingDown = false;
let exitedChildren = 0;
/** @type {"convex" | "next" | "demo" | null} */
let lastLogSource = null;
let convexOpOpen = false;
/** @type {string[]} */
const nextErrorBuffer = [];
/** @type {string[]} */
const convexErrorBuffer = [];
/** @type {string[]} */
const nextBrowserBuffer = [];
/** @type {"hydration" | "lcp" | null} */
let nextBrowserMode = null;
/** @type {{ sourceName: string; prefix: string; formatted: string | string[] | null }[]} */
const deferredEmits = [];
/** Cloud/dashboard URLs — emitted together after Development (cloud first). */
let pendingConvexCloudUrl = null;
let pendingConvexDashboardUrl = null;
let convexDevRowEmitted = false;
let flushConvexBootLinksAfterEmit = false;
/** True after Convex head until first prepare/wait line — gap before ops. */
let convexBootInfoOpen = false;

function isConvexWaitingPart(part) {
  return /^-\s+.+\.\.\.$/.test(stripAnsi(part).trim());
}

function isConvexSuccessPart(part) {
  return /^✔\s+/.test(stripAnsi(part).trim());
}

function isConvexErrorPart(part) {
  return /^✖/.test(stripAnsi(part).trim());
}

function flushNextBrowserBuffer(prefix = tagFor("next")) {
  if (!nextBrowserBuffer.length) {
    nextBrowserMode = null;
    return;
  }

  const formatted =
    nextBrowserMode === "hydration"
      ? flattenNextFormatted(formatHydrationMismatchSummary(nextBrowserBuffer))
      : nextBrowserMode === "lcp"
        ? flattenNextFormatted(formatLcpWarningRows(nextBrowserBuffer))
        : flattenNextFormatted(
            formatNextBrowserMiscRows(nextBrowserBuffer.join(" ")),
          );

  nextBrowserBuffer.length = 0;
  nextBrowserMode = null;
  emitFormatted("next", prefix, formatted);
}

function flushNextErrorBuffer(prefix = tagFor("next")) {
  if (!nextErrorBuffer.length) {
    return;
  }
  const formatted = flattenNextFormatted(formatNextErrorBlock(nextErrorBuffer), {
    error: true,
  });
  nextErrorBuffer.length = 0;
  emitFormatted("next", prefix, formatted);
}

function flushConvexErrorBuffer(prefix = tagFor("convex")) {
  if (!convexErrorBuffer.length) {
    return;
  }
  const formatted = flattenConvexFormatted(
    formatConvexErrorBlock(convexErrorBuffer),
    { error: true },
  );
  convexErrorBuffer.length = 0;
  convexOpOpen = false;
  emitFormatted("convex", prefix, formatted);
  flushDeferredEmits();
}

function flushDeferredEmits() {
  for (const item of deferredEmits) {
    maybeGapOnSourceSwitch(item.sourceName);
    emitLines(item.prefix, item.formatted);
    markLogSource(item.sourceName);
  }
  deferredEmits.length = 0;
}

function emitFormatted(sourceName, prefix, formatted) {
  if (convexOpOpen && sourceName !== "convex") {
    deferredEmits.push({ sourceName, prefix, formatted });
    return;
  }
  if (sourceName !== "next" && nextErrorBuffer.length) {
    flushNextErrorBuffer();
  }
  if (sourceName !== "convex" && convexErrorBuffer.length) {
    flushConvexErrorBuffer();
  }
  maybeGapOnSourceSwitch(sourceName);
  emitLines(prefix, formatted);
  markLogSource(sourceName);
}

function finishConvexOperation(part) {
  if (!isConvexSuccessPart(part) && !isConvexErrorPart(part)) {
    return;
  }
  convexOpOpen = false;
  flushDeferredEmits();
}

function maybeGapOnSourceSwitch(sourceName) {
  if (sourceName !== "next") {
    flushNextRequestBurst();
  }
  if (lastLogSource && lastLogSource !== sourceName) {
    process.stdout.write("\n");
  }
}

function markLogSource(sourceName) {
  lastLogSource = sourceName;
}

function isEmptyFormattedLine(line) {
  if (line === null) {
    return true;
  }
  const plain = stripAnsi(String(line)).replace(/^▌\s*/, "").trim();
  return plain.length === 0;
}

function devSessionRule() {
  return DIM("─".repeat(Math.min(52, Math.max(24, devTermWidth() - 4))));
}

function printDevSessionHeader() {
  if (!process.stdout.isTTY) {
    return;
  }
  const rule = devSessionRule();
  process.stdout.write(`${rule}\n`);
  process.stdout.write(
    `${BOLD("dev")}  ${tagFor("convex")} ${DIM("+")} ${tagFor("next")}  ${DIM("· Ctrl+C stops both")}`,
  );
  if (requestLogMode !== "normal") {
    process.stdout.write(`  ${DIM(`· requests ${requestLogMode}`)}`);
  }
  process.stdout.write("\n");
  process.stdout.write(`${rule}\n\n`);
}

function printShutdownBanner() {
  process.stdout.write("\n");
  process.stdout.write(
    `${DIM("dev")}  ${FAREWELL("goodbye")}  ${DIM("· next + convex stopped")}\n\n`,
  );
}

function noteChildExit() {
  exitedChildren += 1;
  if (shuttingDown && exitedChildren >= children.length) {
    process.exit(0);
  }
}

function beginShutdown(code = 0, { announce = false } = {}) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  convexOpOpen = false;
  pendingConvexCloudUrl = null;
  pendingConvexDashboardUrl = null;
  convexDevRowEmitted = false;
  flushConvexBootLinksAfterEmit = false;
  convexBootInfoOpen = false;
  flushNextErrorBuffer();
  flushNextBrowserBuffer();
  flushConvexErrorBuffer();
  flushNextRequestBurst();
  flushDeferredEmits();
  if (announce) {
    printShutdownBanner();
  }
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
  setTimeout(() => process.exit(code), 3000).unref();
}

function flattenConvexFormatted(
  formatted,
  { error = false, success = false } = {},
) {
  const rows = Array.isArray(formatted) ? formatted : [formatted];
  return rows.flatMap((row) => wrapConvexBody(row, { error, success }));
}

function barToneForPlain(plain) {
  if (/^✔/.test(plain) || /^✓/.test(plain)) {
    return { success: true };
  }
  return {};
}

function formatConvexLine(line) {
  const text = line.trimEnd();
  if (!text) {
    return null;
  }

  const plain = stripAnsi(text);

  if (shouldSuppressConvexLine(plain)) {
    return null;
  }

  const filesystemWarning = formatConvexFilesystemWarning(plain);
  if (filesystemWarning) {
    return flattenConvexFormatted(filesystemWarning);
  }

  const setupAnswer = formatConvexSetupAnswer(plain);
  if (setupAnswer) {
    return flattenConvexFormatted(setupAnswer, { success: true });
  }

  for (const [pattern, format] of CONVEX_LINE_FORMATTERS) {
    const match = normalizeConvexPlain(plain).match(pattern);
    if (match) {
      return flattenConvexFormatted(format(match), barToneForPlain(plain));
    }
  }

  const normalized = normalizeConvexPlain(plain);
  const waitingMatch = normalized.match(/^-\s+(.+\.\.\.)$/);
  if (waitingMatch) {
    return flattenConvexFormatted(convexWaitingRow(waitingMatch[1]));
  }

  const successMatch = normalized.match(/^✔\s+(.+)$/);
  if (successMatch) {
    return flattenConvexFormatted(convexSuccessRow(successMatch[1]), {
      success: true,
    });
  }

  if (normalized) {
    return flattenConvexFormatted(convexRow(normalized));
  }

  return null;
}

function formatNextLine(line) {
  const text = line.trimEnd();
  if (!text) {
    return null;
  }

  const plain = stripAnsi(text).trim();
  for (const [pattern, format] of NEXT_LINE_FORMATTERS) {
    const match = plain.match(pattern);
    if (match) {
      return flattenNextFormatted(format(match), barToneForPlain(plain));
    }
  }

  return flattenNextFormatted(formatNextPlainLine(plain), barToneForPlain(plain));
}

function emitLines(prefix, formatted) {
  const lines = Array.isArray(formatted) ? formatted : [formatted];
  for (const line of lines) {
    if (line === null) {
      process.stdout.write("\n");
      continue;
    }
    if (line && !isEmptyFormattedLine(line)) {
      process.stdout.write(`${prefix} ${line}\n`);
    }
  }
}

function flushBuffer(buffer, prefix, formatLine, sourceName) {
  if (buffer) {
    emitPart(buffer, prefix, formatLine, sourceName);
  }
  if (sourceName === "next") {
    flushNextBrowserBuffer(prefix);
    flushNextErrorBuffer(prefix);
  }
  if (sourceName === "convex") {
    flushConvexErrorBuffer(prefix);
  }
}

function hasEmitContent(formatted) {
  const lines = Array.isArray(formatted) ? formatted : [formatted];
  return lines.some((line) => !isEmptyFormattedLine(line));
}

function emitPart(part, prefix, formatLine, sourceName) {
  if (shuttingDown) {
    return;
  }
  if (!formatLine) {
    if (!part) {
      return;
    }
    emitFormatted(sourceName, prefix, part);
    return;
  }

  const plain = stripAnsi(part).trim();
  if (sourceName === "next") {
    if (isLcpImageWarning(plain) || isLcpContinuationLine(plain)) {
      if (nextBrowserMode !== "lcp") {
        flushNextBrowserBuffer(prefix);
        nextBrowserMode = "lcp";
      }
      nextBrowserBuffer.push(plain);
      return;
    }

    if (nextBrowserMode === "lcp") {
      flushNextBrowserBuffer(prefix);
    }

    if (isHydrationTreeLine(plain)) {
      if (!nextBrowserMode) {
        flushNextBrowserBuffer(prefix);
        nextBrowserMode = "hydration";
      }
      nextBrowserBuffer.push(plain);
      return;
    }

    if (nextBrowserMode === "hydration") {
      flushNextBrowserBuffer(prefix);
    }

    if (isNextBrowserMisc(plain)) {
      flushNextBrowserBuffer(prefix);
      emitFormatted("next", prefix, formatNextBrowserMiscRows(plain));
      return;
    }

    const requestMatch = plain.match(NEXT_REQUEST_RE);
    if (requestMatch) {
      scheduleNextRequestLog(
        requestMatch[1],
        requestMatch[2],
        requestMatch[3],
        requestMatch[4],
        requestMatch[5],
        prefix,
      );
      return;
    }
    flushNextRequestBurst();
  }
  if (sourceName === "next" && isNextErrorPart(plain)) {
    nextErrorBuffer.push(plain);
    return;
  }
  if (sourceName === "convex" && isConvexErrorBufferPart(plain)) {
    convexErrorBuffer.push(plain);
    return;
  }
  if (sourceName === "next" && nextErrorBuffer.length) {
    flushNextErrorBuffer(prefix);
  }
  if (sourceName === "convex" && convexErrorBuffer.length) {
    flushConvexErrorBuffer(prefix);
  }

  const formatted = formatLine(part);
  if (formatted !== null && hasEmitContent(formatted)) {
    if (sourceName === "convex" && isConvexWaitingPart(part)) {
      if (convexBootInfoOpen) {
        convexBootInfoOpen = false;
        emitConvexBootLinks(prefix, { force: true });
        process.stdout.write("\n");
      }
      convexOpOpen = true;
    }
    emitFormatted(sourceName, prefix, formatted);
    if (sourceName === "convex" && flushConvexBootLinksAfterEmit) {
      flushConvexBootLinksAfterEmit = false;
      emitConvexBootLinks(prefix);
    }
    if (sourceName === "convex") {
      finishConvexOperation(part);
    }
  }
}

function processChunk(chunk, state, prefix, formatLine, sourceName) {
  state.buffer += chunk.toString();
  state.buffer = collapseCarriageReturns(state.buffer);
  const parts = state.buffer.split(/\r?\n/);
  state.buffer = parts.pop() ?? "";
  for (const part of parts) {
    emitPart(part, prefix, formatLine, sourceName);
  }
}

function pipeLines(stream, prefix, formatLine, sourceName) {
  const state = { buffer: "" };

  stream.on("data", (chunk) =>
    processChunk(chunk, state, prefix, formatLine, sourceName),
  );
  stream.on("end", () =>
    flushBuffer(state.buffer, prefix, formatLine, sourceName),
  );
}

function shutdown(code = 0) {
  beginShutdown(code);
}

function onChildExit(code, signal) {
  noteChildExit();
  if (shuttingDown) {
    return;
  }
  if (signal) {
    beginShutdown(0);
    return;
  }
  if (code !== 0) {
    beginShutdown(code ?? 1);
  }
}

function onChildError(name, child, command, error) {
  const index = children.indexOf(child);
  if (index !== -1) {
    children.splice(index, 1);
  }
  emitStartFailure(name, command, error.message);
  shutdown(1);
}

function emitStartFailure(name, command, message) {
  const prefix = tagFor(name);
  emitFormatted(
    name,
    prefix,
    `${ERROR_BAR} ${RED("Failed to start")} ${DIM("`")}${command}${DIM("`")}: ${RED(message)}`,
  );
}

const DEMO_DELAY_MS = 120;

function parseDevArgs(argv) {
  const args = {
    demo: argv.includes("--demo"),
    fast: argv.includes("--fast"),
    shutdown: !argv.includes("--no-shutdown"),
    list: argv.includes("--list"),
    help: argv.includes("--help") || argv.includes("-h"),
    scenario: "all",
    requestLogMode: resolveRequestLogMode(argv),
  };

  for (const arg of argv) {
    if (arg.startsWith("--scenario=")) {
      args.scenario = arg.slice("--scenario=".length);
    }
  }

  return args;
}

function printDevHelp() {
  process.stdout.write("\n");
  process.stdout.write(
    `${NEXT_BAR} ${BOLD("dev")} ${DIM("· Convex + Next with formatted logs")}\n\n`,
  );
  process.stdout.write(
    `${NEXT_BAR}  ${branchLink(`${DIM("usage")}  npm run dev [-- flags]`)}\n`,
  );
  process.stdout.write(
    `${NEXT_BAR}  ${branchLink(`${DIM("flags")}  --requests=quiet|normal|verbose  --help`)}\n\n`,
  );
  process.stdout.write(`${NEXT_BAR} ${DIM("request logs")}\n`);
  process.stdout.write(
    `${NEXT_BAR}  ${branchLink(`${DIM("normal")}   single line · hide fast GETs · show slow/errors (default)`)}`,
  );
  process.stdout.write("\n");
  process.stdout.write(
    `${NEXT_BAR}  ${branchLink(`${DIM("quiet")}    hide all HTTP request lines`)}`,
  );
  process.stdout.write("\n");
  process.stdout.write(
    `${NEXT_BAR}  ${branchLink(`${DIM("verbose")}  two-line groups · full timing breakdown`)}`,
  );
  process.stdout.write("\n");
  process.stdout.write(
    `${NEXT_BAR}  ${branchLink(`${DIM("env")}     DEV_REQUEST_LOG=quiet|normal|verbose`)}`,
  );
  process.stdout.write("\n\n");
  process.stdout.write(`${NEXT_BAR} ${DIM("demo replay")}\n`);
  process.stdout.write(
    `${NEXT_BAR}  ${branchLink(`${DIM("usage")}  npm run dev:demo [-- --scenario=requests --fast]`)}`,
  );
  process.stdout.write("\n\n");
}

/** @type {Record<string, { label: string; events: { source: "convex" | "next"; line: string; pause?: number }[] }>} */
const DEMO_SCENARIOS = {
  startup: {
    label: "Convex + Next boot sequence",
    events: [
      { source: "convex", line: "▌ Developing against deployment:" },
      {
        source: "convex",
        line: "▌   └─ https://agreeable-jellyfish-483.convex.cloud",
      },
      {
        source: "convex",
        line:
          "▌ [Development] gsap-cocktails:agreeable-jellyfish-483 (dev) (dashboard: https://dashboard.convex.dev/d/agreeable-jellyfish-483)",
      },
      { source: "convex", line: "- Preparing Convex functions..." },
      {
        source: "next",
        line: "GET / 200 in 537ms (next.js: 121ms, proxy.ts: 193ms, application-code: 223ms)",
      },
      { source: "convex", line: "✔ 3:45:12 PM Convex functions ready! (1.83s)" },
      { source: "convex", line: "- Preparing Convex functions..." },
      { source: "convex", line: "✔ 3:45:18 PM Convex functions ready! (3.34s)" },
      { source: "next", line: "▲ Next.js 15.2.4" },
      { source: "next", line: "- Local:        http://localhost:3000" },
      { source: "next", line: "- Network:      http://192.168.1.42:3000" },
      { source: "next", line: "- Environments: .env.local" },
      { source: "next", line: "✓ Ready in 1847ms" },
    ],
  },
  requests: {
    label: "HTTP request logs (normal mode — fast GETs hidden)",
    events: [
      { source: "next", line: "▲ Next.js 15.2.4" },
      { source: "next", line: "- Local:        http://localhost:3000" },
      { source: "next", line: "✓ Ready in 1200ms" },
      {
        source: "next",
        line: "GET /api/contact 200 in 8ms (next.js: 3ms, application-code: 5ms)",
      },
      {
        source: "next",
        line: "GET /home 200 in 89ms (next.js: 5ms, proxy.ts: 4ms, application-code: 80ms)",
      },
      {
        source: "next",
        line: "GET / 200 in 560ms (next.js: 121ms, proxy.ts: 193ms, application-code: 223ms)",
      },
      {
        source: "next",
        line: "GET / 200 in 2400ms (next.js: 210ms, proxy.ts: 35ms, application-code: 2.2s)",
      },
      {
        source: "next",
        line: "POST /api/contact 500 in 42ms (compile: 3ms, render: 39ms)",
      },
      {
        source: "next",
        line: "GET /missing-page 404 in 12ms (compile: 2ms, render: 10ms)",
      },
    ],
  },
  changes: {
    label: "File saves — Next compile + Convex push",
    events: [
      { source: "next", line: "▲ Next.js 15.2.4" },
      { source: "next", line: "✓ Ready in 900ms" },
      { source: "next", line: "○ Compiling /about ..." },
      { source: "next", line: "✓ Compiled /about in 892ms (521 modules)" },
      { source: "next", line: "✓ Compiled in 21ms" },
      { source: "next", line: "✓ Compiled in 13ms" },
      {
        source: "next",
        line:
          "⚠ Fast Refresh had to perform a full reload when ./src/components/Hero.tsx changed. Read more: https://nextjs.org/docs/messages/fast-refresh-reload",
      },
      {
        source: "next",
        line: "GET /about 200 in 234ms (compile: 180ms, render: 54ms)",
      },
      { source: "convex", line: "- Bundling component schemas and modules..." },
      { source: "convex", line: "✔ 3:46:01 PM Finished bundling! (456ms)" },
      { source: "convex", line: "- Pushing code to deployment..." },
      { source: "convex", line: "✔ 3:46:03 PM Code pushed! (1.21s)" },
    ],
  },
  setup: {
    label: "Convex first-run wizard (clean output)",
    events: [
      { source: "convex", line: "▌  ? What would you like to configure?" },
      { source: "convex", line: "▌  ❯ create a new project" },
      {
        source: "convex",
        line:
          "▌  ↑↓ navigate • ⏎ select✔ What would you like to configure? create a new project",
      },
      {
        source: "convex",
        line: "▌  ✔ Project name: gsap-cocktails-main",
      },
      {
        source: "convex",
        line:
          "▌  ↑↓ navigate • ⏎ select✔ Use cloud or local dev deployment? For more see https://docs.convex.dev/cli/local-deployments cloud deployment",
      },
      {
        source: "convex",
        line:
          "▌  ✔ Created project gsap-cocktails-main, manage it at https://dashboard.convex.dev/t/acheronx/gsap-cocktails-main",
      },
      {
        source: "convex",
        line:
          "▌ Temporary directory 'C:\\Temp' and project directory 'convex' are on different filesystems.",
      },
      {
        source: "convex",
        line:
          "▌  ✔ Set up Convex AI files? (guidelines, AGENTS.md, agent skills) Yes",
      },
      {
        source: "convex",
        line: "▌  ✔ guidelines.md written",
      },
      { source: "convex", line: "▌  ✔ Skills installed" },
      { source: "convex", line: "▌  ✔ Provisioned a dev deployment and saved its:" },
      { source: "convex", line: "▌  Convex " },
      {
        source: "convex",
        line: "▌   Development   acheronx:gsap-cocktails-main:dev/acheronx (dev)",
      },
      {
        source: "convex",
        line: "▌  └→  cloud   https://acoustic-chihuahua-189.convex.cloud",
      },
      {
        source: "convex",
        line:
          "▌  └→  dashboard   https://dashboard.convex.dev/t/acheronx/gsap-cocktails-main/acoustic-chihuahua-189",
      },
    ],
  },
  errors: {
    label: "Compile errors, push failures, spawn failure",
    events: [
      { source: "next", line: "▲ Next.js 15.2.4" },
      { source: "next", line: "✓ Ready in 900ms" },
      { source: "next", line: "⨯ ./src/app/page.tsx" },
      {
        source: "next",
        line: "Module not found: Can't resolve '@/components/Missing'",
      },
      { source: "next", line: "Error: Failed to compile" },
      {
        source: "next",
        line: "GET / 500 in 15ms (compile: 8ms, render: 7ms)",
      },
      {
        source: "convex",
        line: "✖ Error while pushing: Could not push deployment",
      },
      {
        source: "convex",
        line: 'Invalid schema change in table "contacts"',
      },
      {
        source: "next",
        line: "__spawn_error__:ENOENT: npx next dev",
        pause: 0,
      },
    ],
  },
};

const DEMO_SCENARIO_ORDER = ["startup", "requests", "changes", "errors"];

const DEMO_SCENARIO_TONES = {
  startup: STARTUP,
  requests: REQUESTS,
  changes: GREEN,
  errors: RED,
};

function demoScenarioTone(name) {
  return DEMO_SCENARIO_TONES[name] ?? WHITE;
}

function demoScenarioBar(name) {
  return demoScenarioTone(name)("▌");
}

function formatDemoScenarioHeader(name, label) {
  const tone = demoScenarioTone(name);
  return `\n${demoScenarioBar(name)} ${DIM("demo")} ${tone(name)} ${DIM(`· ${label}`)}\n`;
}

function demoFormatFor(sourceName) {
  return sourceName === "convex" ? formatConvexLine : formatNextLine;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printDemoHelp() {
  process.stdout.write("\n");
  process.stdout.write(
    `${CONVEX_BAR} ${BOLD("dev demo")} ${DIM("· replay formatted CLI output without starting servers")}\n\n`,
  );
  process.stdout.write(
    `${CONVEX_BAR}  ${branchLink(`${DIM("usage")}  npm run dev:demo [-- flags]`)}\n`,
  );
  process.stdout.write(
    `${CONVEX_BAR}  ${branchLink(`${DIM("flags")}  --scenario=<name>  --fast  --no-shutdown  --list`)}\n\n`,
  );
  process.stdout.write(`${CONVEX_BAR} ${DIM("scenarios")}\n`);
  for (const key of DEMO_SCENARIO_ORDER) {
    const scenario = DEMO_SCENARIOS[key];
    process.stdout.write(
      `${CONVEX_BAR}  ${branchLink(`${DIM(key.padEnd(9))}${scenario.label}`)}\n`,
    );
  }
  process.stdout.write("\n");
}

function printDemoList() {
  process.stdout.write(`${CONVEX_BAR} ${DIM("demo scenarios")}\n`);
  for (const key of DEMO_SCENARIO_ORDER) {
    process.stdout.write(
      `${CONVEX_BAR}  ${branchLink(`${DIM(key.padEnd(9))}${DEMO_SCENARIOS[key].label}`)}\n`,
    );
  }
  process.stdout.write("\n");
}

async function replayDemoEvent(event) {
  if (event.line.startsWith("__spawn_error__:")) {
    const message = event.line.slice("__spawn_error__:".length);
    emitStartFailure("next", "npx next dev", message);
    return;
  }

  const prefix = tagFor(event.source);
  const formatLine = demoFormatFor(event.source);
  emitPart(event.line, prefix, formatLine, event.source);
}

async function runDemoScenario(name, { fast }) {
  const scenario = DEMO_SCENARIOS[name];
  if (!scenario) {
    process.stderr.write(`Unknown demo scenario "${name}". Run with --list.\n`);
    process.exit(1);
  }

  lastLogSource = null;
  nextErrorBuffer.length = 0;
  convexErrorBuffer.length = 0;
  nextBrowserBuffer.length = 0;
  nextBrowserMode = null;
  pendingConvexCloudUrl = null;
  pendingConvexDashboardUrl = null;
  convexDevRowEmitted = false;
  flushConvexBootLinksAfterEmit = false;
  convexBootInfoOpen = false;
  process.stdout.write(formatDemoScenarioHeader(name, scenario.label));
  lastLogSource = "demo";

  for (const event of scenario.events) {
    await replayDemoEvent(event);
    if (!fast) {
      await sleep(event.pause ?? DEMO_DELAY_MS);
    }
  }

  flushNextBrowserBuffer();
  flushNextRequestBurst();
}

async function runDemo({ scenario, fast, shutdown: showShutdown }) {
  if (scenario === "all") {
    for (const name of DEMO_SCENARIO_ORDER) {
      await runDemoScenario(name, { fast });
      if (!fast) {
        await sleep(280);
      }
    }
  } else {
    await runDemoScenario(scenario, { fast });
  }

  if (showShutdown) {
    if (!fast) {
      await sleep(200);
    }
    printShutdownBanner();
  }
}

function spawnDev(name, command, formatLine) {
  const child = spawn(command, [], {
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
  });

  children.push(child);
  const prefix = tagFor(name);
  pipeLines(child.stdout, prefix, formatLine, name);
  pipeLines(child.stderr, prefix, formatLine, name);
  child.on("error", (error) => onChildError(name, child, command, error));
  child.on("exit", onChildExit);
}

process.on("SIGINT", () => {
  beginShutdown(0, { announce: true });
});

process.on("SIGTERM", () => {
  beginShutdown(0, { announce: true });
});

async function main() {
  const devArgs = parseDevArgs(process.argv.slice(2));
  requestLogMode = devArgs.requestLogMode;

  if (devArgs.help && !devArgs.demo) {
    printDevHelp();
    return;
  }

  if (devArgs.help && devArgs.demo) {
    printDemoHelp();
    return;
  }

  if (devArgs.list) {
    printDemoList();
    return;
  }

  if (devArgs.demo) {
    await runDemo(devArgs);
    return;
  }

  printDevSessionHeader();
  spawnDev("convex", "npx convex dev", formatConvexLine);
  spawnDev("next", "npx next dev", formatNextLine);
}

main();
