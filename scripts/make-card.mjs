#!/usr/bin/env node
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const mode = args.mode === "full" ? "full" : "draft";
const outputPath = requiredArg(args, "out");
const audioPath = requiredArg(args, "audio");
const face1Path = requiredArg(args, "face1");
const face2Path = args.face2;
const recipientName = args.name || "Birthday Icon";
const bpm = Number(args.bpm || 116);
const durationSeconds = mode === "full" ? 35 : 5;
const width = mode === "full" ? 720 : 360;
const height = mode === "full" ? 900 : 450;
const faceSize = mode === "full" ? 172 : 86;
const bobPixels = mode === "full" ? 12 : 6;
const bodyTop = Math.round(height * 0.44);
const bodyHeight = Math.round(height * 0.34);
const soloAnchor = {
  x: Math.round(width * 0.5 - faceSize / 2),
  y: Math.round(height * 0.25),
};
const duoAnchors = [
  {
    x: Math.round(width * 0.34 - faceSize / 2),
    y: Math.round(height * 0.25),
  },
  {
    x: Math.round(width * 0.66 - faceSize / 2),
    y: Math.round(height * 0.25),
  },
];
const anchors = face2Path ? duoAnchors : [soloAnchor];

await Promise.all([access(audioPath), access(face1Path), face2Path ? access(face2Path) : null]);
await mkdir(path.dirname(outputPath), { recursive: true });

const titleCardPath = path.join(path.dirname(outputPath), "title-card.ppm");
const outroCardPath = path.join(path.dirname(outputPath), "outro-card.ppm");
await writeTextCard(titleCardPath, "BIRTHDAY ROYALE", width, Math.round(height * 0.16), "#ff3da7");
await writeTextCard(
  outroCardPath,
  `HAPPY BIRTHDAY ${recipientName}`.toUpperCase(),
  width,
  Math.round(height * 0.15),
  "#ffffff",
);

const ffmpegArgs = [
  "-y",
  "-f",
  "lavfi",
  "-i",
  `color=c=#1B1035:s=${width}x${height}:r=30:d=${durationSeconds}`,
  "-stream_loop",
  "-1",
  "-i",
  audioPath,
  "-loop",
  "1",
  "-t",
  String(durationSeconds),
  "-i",
  face1Path,
];

if (face2Path) {
  ffmpegArgs.push("-loop", "1", "-t", String(durationSeconds), "-i", face2Path);
}

ffmpegArgs.push(
  "-loop",
  "1",
  "-t",
  String(durationSeconds),
  "-i",
  titleCardPath,
  "-loop",
  "1",
  "-t",
  String(durationSeconds),
  "-i",
  outroCardPath,
);

ffmpegArgs.push(
  "-filter_complex",
  buildFilterGraph(),
  "-map",
  "[vout]",
  "-map",
  "1:a",
  "-t",
  String(durationSeconds),
  "-c:v",
  "libx264",
  "-preset",
  mode === "full" ? "medium" : "ultrafast",
  "-pix_fmt",
  "yuv420p",
  "-c:a",
  "aac",
  "-b:a",
  "160k",
  "-movflags",
  "+faststart",
  outputPath,
);

await run("ffmpeg", ffmpegArgs);

function buildFilterGraph() {
  const faceFilters = [
    buildFaceFilter("2:v", "face1"),
    face2Path ? buildFaceFilter("3:v", "face2") : null,
    buildTextCardFilter(face2Path ? "4:v" : "3:v", "titlecard"),
    buildTextCardFilter(face2Path ? "5:v" : "4:v", "outrocard"),
  ].filter(Boolean);
  const bodyFilters = [
    `[0:v]${buildBackdropFilters()}[scene]`,
    `[scene]${buildBodyFilters()}[body]`,
  ];
  const overlayFilters = [
    `[body][face1]overlay=x=${anchors[0].x}:y='${anchors[0].y}+${bobPixels}*sin(2*PI*t*${bpm}/60)'[withface1]`,
    face2Path
      ? `[withface1][face2]overlay=x=${anchors[1].x}:y='${anchors[1].y}+${bobPixels}*sin(2*PI*t*${bpm}/60+PI)'[withfaces]`
      : null,
    `${face2Path ? "[withfaces]" : "[withface1]"}[titlecard]overlay=x=0:y=${Math.round(height * 0.04)}[withtitle]`,
    `[withtitle][outrocard]overlay=x=0:y=${Math.round(height * 0.8)}:enable='gte(t,${Math.max(durationSeconds - 5, 0)})'[vout]`,
  ].filter(Boolean);

  return [...faceFilters, ...bodyFilters, ...overlayFilters].join(";");
}

function buildFaceFilter(input, label) {
  const radius = faceSize / 2;
  const alphaExpression = `if(lte((X-${radius})*(X-${radius})+(Y-${radius})*(Y-${radius}),${radius * radius}),255,0)`;

  return `[${input}]scale=${faceSize}:${faceSize}:force_original_aspect_ratio=increase,crop=${faceSize}:${faceSize},format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='${alphaExpression}'[${label}]`;
}

function buildTextCardFilter(input, label) {
  return `[${input}]format=rgb24,colorkey=0x00ff00:0.18:0.02[${label}]`;
}

function buildBackdropFilters() {
  return [
    `drawbox=x=0:y=0:w=iw:h=ih:color=#1B1035:t=fill`,
    `drawbox=x=0:y=${Math.round(height * 0.72)}:w=iw:h=${Math.round(height * 0.28)}:color=#3B145D@0.92:t=fill`,
    `drawbox=x=0:y=${Math.round(height * 0.78)}:w=iw:h=8:color=#FF3DA7@0.9:t=fill`,
    `drawbox=x=0:y=${Math.round(height * 0.86)}:w=iw:h=8:color=#FFC857@0.9:t=fill`,
  ].join(",");
}

function buildBodyFilters() {
  const bodyWidth = Math.round(width * 0.16);
  const soloX = Math.round(width * 0.5 - bodyWidth / 2);
  const duoX1 = Math.round(width * 0.34 - bodyWidth / 2);
  const duoX2 = Math.round(width * 0.66 - bodyWidth / 2);
  const leftX = face2Path ? duoX1 : soloX;
  const rightBody = face2Path
    ? `,drawbox=x=${duoX2}:y=${bodyTop}:w=${bodyWidth}:h=${bodyHeight}:color=#E8B923@0.95:t=fill,drawbox=x=${duoX2 - 18}:y=${bodyTop + 45}:w=18:h=140:color=#E8B923@0.9:t=fill,drawbox=x=${duoX2 + bodyWidth}:y=${bodyTop + 45}:w=18:h=140:color=#E8B923@0.9:t=fill`
    : "";

  return [
    `drawbox=x=${leftX}:y=${bodyTop}:w=${bodyWidth}:h=${bodyHeight}:color=#B0004E@0.95:t=fill`,
    `drawbox=x=${leftX - 18}:y=${bodyTop + 45}:w=18:h=140:color=#B0004E@0.9:t=fill`,
    `drawbox=x=${leftX + bodyWidth}:y=${bodyTop + 45}:w=18:h=140:color=#B0004E@0.9:t=fill`,
    rightBody.replace(/^,/, ""),
  ]
    .filter(Boolean)
    .join(",");
}

function parseArgs(rawArgs) {
  const parsed = {};

  for (let index = 0; index < rawArgs.length; index += 1) {
    const key = rawArgs[index];
    if (!key.startsWith("--")) continue;
    parsed[key.slice(2)] = rawArgs[index + 1];
    index += 1;
  }

  return parsed;
}

function requiredArg(parsed, key) {
  if (!parsed[key]) {
    throw new Error(`Missing required --${key} argument.`);
  }

  return parsed[key];
}

function run(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `${command} exited with ${code}`));
    });
  });
}

async function writeTextCard(filePath, text, cardWidth, cardHeight, color) {
  const background = [0, 255, 0];
  const foreground = hexToRgb(color);
  const pixels = new Uint8Array(cardWidth * cardHeight * 3);

  for (let index = 0; index < pixels.length; index += 3) {
    pixels[index] = background[0];
    pixels[index + 1] = background[1];
    pixels[index + 2] = background[2];
  }

  const cleanedText = text.replace(/[^A-Z0-9 !?.-]/g, "").slice(0, 28);
  const scale = Math.max(
    2,
    Math.min(
      mode === "full" ? 9 : 4,
      Math.floor((cardWidth * 0.9) / Math.max(cleanedText.length * 6, 1)),
    ),
  );
  const textWidth = cleanedText.length * 6 * scale;
  const textHeight = 7 * scale;
  const startX = Math.max(0, Math.floor((cardWidth - textWidth) / 2));
  const startY = Math.max(0, Math.floor((cardHeight - textHeight) / 2));

  for (let charIndex = 0; charIndex < cleanedText.length; charIndex += 1) {
    drawGlyph(
      pixels,
      cardWidth,
      cardHeight,
      startX + charIndex * 6 * scale,
      startY,
      cleanedText[charIndex],
      scale,
      foreground,
    );
  }

  const header = Buffer.from(`P6\n${cardWidth} ${cardHeight}\n255\n`, "ascii");
  await writeFile(filePath, Buffer.concat([header, Buffer.from(pixels)]));
}

function drawGlyph(pixels, width, height, startX, startY, char, scale, color) {
  const font = getFont();
  const glyph = font[char] ?? font[" "];

  glyph.forEach((row, rowIndex) => {
    [...row].forEach((cell, columnIndex) => {
      if (cell !== "1") return;

      for (let y = 0; y < scale; y += 1) {
        for (let x = 0; x < scale; x += 1) {
          const pixelX = startX + columnIndex * scale + x;
          const pixelY = startY + rowIndex * scale + y;
          if (pixelX < 0 || pixelX >= width || pixelY < 0 || pixelY >= height) {
            continue;
          }

          const offset = (pixelY * width + pixelX) * 3;
          pixels[offset] = color[0];
          pixels[offset + 1] = color[1];
          pixels[offset + 2] = color[2];
        }
      }
    });
  });
}

function hexToRgb(value) {
  const normalized = value.replace("#", "");

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function getFont() {
  return {
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
    "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
    "?": ["11110", "00001", "00001", "00110", "00100", "00000", "00100"],
    ".": ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
    "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    G: ["01111", "10000", "10000", "10011", "10001", "10001", "01111"],
    H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
    K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
    X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  };
}
