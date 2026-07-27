/**
 * assemble-video.mjs — Assemble the final 9:16 marketing video (US3).
 *
 * Consumes:
 *  - output/scenes/durations.json  (per-scene narration lengths + headlines, from US2)
 *  - output/scenes/clips.json      (scene → source file + start/end offsets, from record)
 *  - output/scenes/mobile-session.webm / desktop-glimpse.webm (footage)
 *  - output/voiceover.mp3          (approved narration track)
 *
 * Per scene: cut the footage slice, size it to EXACTLY the scene's narration
 * duration (contract rule 4 — sync unit = scene), compose to a 1080×1920
 * portrait frame, and burn the scene's FULL narration as a wrapped subtitle
 * (white text on a semi-opaque dark pill, safe-area inset — FR-011). Then
 * concat all scenes, mux the voiceover → H.264 yuv420p CRF 21 + AAC, +faststart.
 *
 * Layout notes (verified against recorded frames):
 *  - Playwright never UPSCALES: the mobile take's real content is 390×844 in
 *    the top-left of the 780×1688 canvas (gray padding right/bottom) → crop
 *    the content, cover-crop to 9:16 anchored to the TOP (keeps the header;
 *    the trimmed bottom is decorative background), upscale to 1080×1920.
 *  - S8 (desktop-glimpse) is a clean 1280×800 take → framed scaled-to-width
 *    on a light branded band inside the portrait canvas, with the product
 *    logo + tagline below (end-card; contract rule 8 — never letterboxed).
 */
import { spawn } from 'node:child_process';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCENES_DIR = path.join(HERE, 'output', 'scenes');
const VOICEOVER = path.join(HERE, 'output', 'voiceover.mp3');
/** LAYOUT=desktop assembles the 16:9 landscape cut from the desktop recording. */
const DESKTOP = process.env.LAYOUT === 'desktop';
const FINAL = path.join(
  HERE,
  'output',
  DESKTOP ? 'vii-pass-marketing-16x9.mp4' : 'vii-pass-marketing-9x16.mp4',
);
/** Product logo (read-only use of the shipped frontend asset). */
const LOGO = path.join(HERE, '..', '..', 'frontend', 'public', 'logo', 'full_logo.png');

/** Windows system font for the burned-in captions (drawtext-escaped). */
const FONT = 'C\\:/Windows/Fonts/arial.ttf';
/** Real content rectangle inside the recorded mobile canvas (see header note). */
const MOBILE_CONTENT = { width: 390, height: 844 };
/** 9:16 crop of the mobile content, anchored to the top (390 × 390*16/9). */
const MOBILE_CROP_HEIGHT = 694;

/** Run the bundled ffmpeg binary (cwd = pipeline folder for relative paths). */
function ffmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { cwd: HERE, stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('close', (code) =>
      code === 0 ? resolve(stderr) : reject(new Error(`ffmpeg failed:\n${stderr.slice(-4000)}`)),
    );
  });
}

/** Measure decoded duration (seconds) via a null decode. */
async function durationOf(file) {
  const stderr = await ffmpeg(['-i', file, '-f', 'null', '-']);
  const times = [...stderr.matchAll(/time=(\d+):(\d+):(\d+\.\d+)/g)];
  if (times.length === 0) throw new Error(`Could not measure duration of ${file}`);
  const [, h, m, s] = times[times.length - 1];
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

/**
 * Wrap the narration into lines of at most `maxChars` characters (word
 * boundaries only) so drawtext renders a readable multi-line subtitle —
 * drawtext has no wrapping of its own.
 */
function wrapCaption(text, maxChars) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && line.length + 1 + word.length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

/**
 * Subtitle filter for a scene's full narration (FR-011): white wrapped text on
 * a semi-opaque dark pill, horizontally centered, safe-area inset from the
 * BOTTOM (the top hosts the app header and, in S7, the open user menu — the
 * bottom band is always free of UI in every scene). The text lives in a file
 * so punctuation never fights filter-graph escaping.
 */
function captionFilter(sceneId) {
  // Landscape frames are shorter — tuck the pill closer to the bottom edge.
  const bottomInset = DESKTOP ? 70 : 280;
  return (
    `drawtext=textfile=output/scenes/${sceneId}.caption.txt:fontfile='${FONT}'` +
    ':fontsize=42:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=18:line_spacing=12' +
    `:x=(w-text_w)/2:y=h-text_h-${bottomInset}`
  );
}

/** Build one mobile scene: crop content → top-anchored 9:16 → 1080×1920. */
async function buildMobileScene(scene, seconds, outFile) {
  const filter =
    `crop=${MOBILE_CONTENT.width}:${MOBILE_CONTENT.height}:0:0,` +
    `crop=${MOBILE_CONTENT.width}:${MOBILE_CROP_HEIGHT}:0:0,` +
    'scale=1080:1920:flags=lanczos,setsar=1,fps=30,format=yuv420p,' +
    captionFilter(scene.id);
  await ffmpeg([
    '-y',
    '-ss', String(scene.start),
    '-i', path.join(SCENES_DIR, scene.file),
    '-t', seconds.toFixed(3),
    '-vf', filter,
    '-an',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21',
    outFile,
  ]);
}

/** Build one desktop scene (16:9 cut): 1280×720 content → 1920×1080. */
async function buildDesktopMainScene(scene, seconds, outFile) {
  const filter =
    'crop=1280:720:0:0,scale=1920:1080:flags=lanczos,setsar=1,fps=30,format=yuv420p,' +
    captionFilter(scene.id);
  await ffmpeg([
    '-y',
    '-ss', String(scene.start),
    '-i', path.join(SCENES_DIR, scene.file),
    '-t', seconds.toFixed(3),
    '-vf', filter,
    '-an',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21',
    outFile,
  ]);
}

/**
 * Build the S8 mobile-glimpse end-card for the 16:9 cut: light branded band,
 * the phone clip framed at the LEFT, logo + tagline on the right half
 * (mirror of the portrait cut's desktop end-card; never letterboxed).
 */
async function buildMobileGlimpseScene(scene, seconds, outFile) {
  const filter =
    `color=c=0xe8f0f8:s=1920x1080:r=30:d=${seconds.toFixed(3)}[bg];` +
    // Phone clip scaled to fit the band height with a subtle frame line.
    '[0:v]scale=-2:920,setsar=1,fps=30,' +
    'pad=iw+8:ih+8:4:4:color=0x0b2a4a[clip];' +
    '[1:v]scale=640:-1[logo];' +
    '[bg][clip]overlay=340:80[t1];' +
    // Right-half column (centered around x≈1346) hosts the logo + tagline.
    '[t1][logo]overlay=1346-w/2:360[t2];' +
    `[t2]drawtext=text='Try Vii Pass today.':fontfile='${FONT}'` +
    ':fontsize=58:fontcolor=0x0b2a4a:x=1346-text_w/2:y=560,' +
    `${captionFilter(scene.id)},format=yuv420p[out]`;
  await ffmpeg([
    '-y',
    '-ss', String(scene.start),
    '-i', path.join(SCENES_DIR, scene.file),
    '-i', LOGO,
    '-t', seconds.toFixed(3),
    '-filter_complex', filter,
    '-map', '[out]',
    '-an',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21',
    '-t', seconds.toFixed(3),
    outFile,
  ]);
}

/**
 * Build the S8 desktop-glimpse scene: light branded band, desktop clip framed
 * scaled-to-width with a border, logo + tagline end-card below (contract rule 8).
 */
async function buildDesktopScene(scene, seconds, outFile) {
  const filter =
    // Light brand band as the portrait canvas.
    `color=c=0xe8f0f8:s=1080x1920:r=30:d=${seconds.toFixed(3)}[bg];` +
    // Desktop clip scaled to width with a subtle frame line.
    '[0:v]scale=1000:-2,setsar=1,fps=30,' +
    'pad=1008:ih+8:4:4:color=0x0b2a4a[clip];' +
    // Logo scaled for the end-card area.
    '[1:v]scale=640:-1[logo];' +
    '[bg][clip]overlay=(W-w)/2:430[t1];' +
    '[t1][logo]overlay=(W-w)/2:1180[t2];' +
    // Tagline under the logo, then the standard headline caption pill.
    `[t2]drawtext=text='Try Vii Pass today.':fontfile='${FONT}'` +
    ':fontsize=58:fontcolor=0x0b2a4a:x=(w-text_w)/2:y=1420,' +
    `${captionFilter(scene.id)},format=yuv420p[out]`;
  await ffmpeg([
    '-y',
    '-ss', String(scene.start),
    '-i', path.join(SCENES_DIR, scene.file),
    '-i', LOGO,
    '-t', seconds.toFixed(3),
    '-filter_complex', filter,
    '-map', '[out]',
    '-an',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21',
    '-t', seconds.toFixed(3),
    outFile,
  ]);
}

async function main() {
  const durations = JSON.parse(await readFile(path.join(SCENES_DIR, 'durations.json'), 'utf8'));
  const clips = JSON.parse(await readFile(path.join(SCENES_DIR, 'clips.json'), 'utf8'));
  const audioByScene = new Map(durations.scenes.map((s) => [s.id, s]));

  // Build each scene at exactly its narration duration.
  const processed = [];
  for (const scene of clips.scenes) {
    const audio = audioByScene.get(scene.id);
    if (!audio) throw new Error(`No narration duration for ${scene.id}`);
    const footage = scene.end - scene.start;
    if (footage + 0.05 < audio.seconds) {
      throw new Error(
        `${scene.id}: footage ${footage.toFixed(2)}s < narration ${audio.seconds.toFixed(2)}s — re-record`,
      );
    }
    // Full narration as the on-screen subtitle (wrapped for the frame width).
    await writeFile(
      path.join(SCENES_DIR, `${scene.id}.caption.txt`),
      wrapCaption(audio.narration ?? audio.headline, DESKTOP ? 70 : 42),
    );
    const outFile = path.join(SCENES_DIR, `${scene.id}.proc.mp4`);
    console.log(`Building ${scene.id} [${scene.layout}] — ${audio.seconds.toFixed(2)}s…`);
    if (scene.layout === 'desktop-glimpse') {
      await buildDesktopScene(scene, audio.seconds, outFile);
    } else if (scene.layout === 'mobile-glimpse') {
      await buildMobileGlimpseScene(scene, audio.seconds, outFile);
    } else if (scene.layout === 'desktop') {
      await buildDesktopMainScene(scene, audio.seconds, outFile);
    } else {
      await buildMobileScene(scene, audio.seconds, outFile);
    }
    processed.push({ id: scene.id, file: outFile });
  }

  // Concat the scene videos (identical codec params → stream copy) + voiceover.
  const listFile = path.join(SCENES_DIR, 'video-concat.txt');
  await writeFile(
    listFile,
    processed.map((p) => `file '${p.file.replaceAll('\\', '/')}'`).join('\n'),
  );
  console.log('Concatenating scenes + muxing voiceover…');
  await ffmpeg([
    '-y',
    '-f', 'concat', '-safe', '0', '-i', listFile,
    '-i', VOICEOVER,
    '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '128k',
    '-movflags', '+faststart',
    '-shortest',
    FINAL,
  ]);

  // Report the deliverable's tech facts (contracts/deliverables.md D3).
  const runtime = await durationOf(FINAL);
  const bytes = (await stat(FINAL)).size;
  const drift = Math.abs(runtime - durations.totalSeconds);
  console.log(`\nFinal: output/${path.basename(FINAL)}`);
  console.log(`  runtime:    ${runtime.toFixed(2)}s (voiceover ${durations.totalSeconds.toFixed(2)}s, drift ${drift.toFixed(2)}s)`);
  console.log(
    DESKTOP
      ? '  resolution: 1920x1080 (16:9), H.264 yuv420p + AAC, +faststart'
      : '  resolution: 1080x1920 (9:16), H.264 yuv420p + AAC, +faststart',
  );
  console.log(`  size:       ${(bytes / 1024 / 1024).toFixed(1)} MB`);
  if (runtime < 50 || runtime > 70) {
    console.error('WARNING: runtime outside 50–70s (SC-001)');
    process.exitCode = 2;
  }
  if (bytes > 40 * 1024 * 1024) {
    console.error('WARNING: file exceeds ~40MB budget — raise CRF and re-run');
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error('Assembly failed:', err);
  process.exit(1);
});
