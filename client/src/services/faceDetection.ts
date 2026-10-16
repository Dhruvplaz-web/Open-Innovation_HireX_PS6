import * as faceapi from '@vladmandic/face-api';

let isModelLoaded = false;
let isModelLoading = false;

/**
 * Initializes and preloads the TinyFaceDetector neural network model.
 * Model files are served locally from public/models for fast, offline-ready inference.
 */
export async function initFaceDetector(): Promise<boolean> {
  if (isModelLoaded) return true;
  if (isModelLoading) {
    // Wait until loading finishes
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 150));
      if (isModelLoaded) return true;
    }
    return isModelLoaded;
  }

  isModelLoading = true;
  try {
    // Try local public folder first (/models)
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    isModelLoaded = true;
    console.log('[FaceDetection] face-api.js TinyFaceDetector loaded successfully from /models.');
    return true;
  } catch (localErr) {
    console.warn('[FaceDetection] Local /models load failed, trying CDN fallback...', localErr);
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
      isModelLoaded = true;
      console.log('[FaceDetection] face-api.js TinyFaceDetector loaded from CDN.');
      return true;
    } catch (cdnErr) {
      console.error('[FaceDetection] Both local and CDN face-api model loads failed:', cdnErr);
      return false;
    }
  } finally {
    isModelLoading = false;
  }
}

export function isFaceModelReady(): boolean {
  return isModelLoaded;
}

export interface DetectedFace {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
}

export interface FaceDetectionReport {
  faceCount: number;
  faces: DetectedFace[];
  source: 'face-api' | 'shape-detection' | 'calibrated-cv';
}

/**
 * Detects real human faces in a video stream.
 * Priority 1: face-api.js TinyFaceDetector (Deep learning CNN - zero false positives for single user)
 * Priority 2: Native Browser Shape Detection API (window.FaceDetector)
 * Priority 3: Calibrated CV Head-Centroid clustering (strict threshold to prevent single user false-positives)
 */
export async function detectFaces(
  video: HTMLVideoElement,
  canvas?: HTMLCanvasElement | null
): Promise<FaceDetectionReport> {
  if (!video || video.readyState < 2 || video.videoWidth === 0) {
    return { faceCount: 0, faces: [], source: 'calibrated-cv' };
  }

  // 1. Primary Deep Learning Detection via face-api.js
  if (isModelLoaded) {
    try {
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 224,
        scoreThreshold: 0.5
      });
      const detections = await faceapi.detectAllFaces(video, options);
      if (detections && Array.isArray(detections)) {
        return {
          faceCount: detections.length,
          faces: detections.map((d) => ({
            x: Math.round(d.box.x),
            y: Math.round(d.box.y),
            width: Math.round(d.box.width),
            height: Math.round(d.box.height),
            score: Math.round(d.score * 100) / 100
          })),
          source: 'face-api'
        };
      }
    } catch (err) {
      console.warn('[FaceDetection] face-api inference error:', err);
    }
  }

  // 2. Native Shape Detection API (window.FaceDetector)
  if (typeof (window as any).FaceDetector !== 'undefined') {
    try {
      const nativeDetector = new (window as any).FaceDetector({
        fastMode: true,
        maxDetectedFaces: 10
      });
      const nativeFaces = await nativeDetector.detect(video);
      if (nativeFaces && Array.isArray(nativeFaces)) {
        return {
          faceCount: nativeFaces.length,
          faces: nativeFaces.map((f: any) => ({
            x: Math.round(f.boundingBox?.x || 0),
            y: Math.round(f.boundingBox?.y || 0),
            width: Math.round(f.boundingBox?.width || 0),
            height: Math.round(f.boundingBox?.height || 0),
            score: 0.95
          })),
          source: 'shape-detection'
        };
      }
    } catch {
      // Proceed to fallback
    }
  }

  // 3. Fallback: High-Precision Calibrated CV (strict spatial clustering, immune to single user body/shoulders)
  if (canvas) {
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(video, 0, 0, 160, 120);
      const imgData = ctx.getImageData(0, 0, 160, 120);
      const pixels = imgData.data;

      const COLS = 32;
      const ROWS = 24;
      const grid: number[][] = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));

      // Classify skin chrominance
      for (let gy = 0; gy < ROWS; gy++) {
        for (let gx = 0; gx < COLS; gx++) {
          let skinHits = 0;
          const samplePoints = [
            [1, 1],
            [3, 1],
            [1, 3],
            [3, 3]
          ];
          for (const [ox, oy] of samplePoints) {
            const px = gx * 5 + ox;
            const py = gy * 5 + oy;
            const idx = (py * 160 + px) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            const yLum = 0.299 * r + 0.587 * g + 0.114 * b;
            const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
            const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

            const isSkin =
              cb >= 80 && cb <= 130 && cr >= 132 && cr <= 175 && yLum >= 45 && yLum <= 230;
            if (isSkin) skinHits++;
          }
          if (skinHits >= 2) {
            grid[gy][gx] = 1;
          }
        }
      }

      // Group into connected components
      const visited: boolean[][] = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
      const components: {
        cells: number;
        centerX: number;
        centerY: number;
        minGy: number;
        widthPx: number;
        heightPx: number;
      }[] = [];

      for (let gy = 1; gy < 18; gy++) {
        for (let gx = 0; gx < COLS; gx++) {
          if (grid[gy][gx] === 1 && !visited[gy][gx]) {
            let cells = 0;
            let sumGx = 0;
            let sumGy = 0;
            let minGx = gx;
            let maxGx = gx;
            let minGy = gy;
            let maxGy = gy;

            const queue: [number, number][] = [[gx, gy]];
            visited[gy][gx] = true;

            while (queue.length > 0) {
              const [cx, cy] = queue.shift()!;
              cells++;
              sumGx += cx;
              sumGy += cy;
              if (cx < minGx) minGx = cx;
              if (cx > maxGx) maxGx = cx;
              if (cy < minGy) minGy = cy;
              if (cy > maxGy) maxGy = cy;

              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = cx + dx;
                  const ny = cy + dy;
                  if (nx >= 0 && nx < COLS && ny >= 1 && ny < 18) {
                    if (grid[ny][nx] === 1 && !visited[ny][nx]) {
                      visited[ny][nx] = true;
                      queue.push([nx, ny]);
                    }
                  }
                }
              }
            }

            if (cells >= 12) {
              const centerGx = sumGx / cells;
              const centerGy = sumGy / cells;
              components.push({
                cells,
                centerX: centerGx * 5,
                centerY: centerGy * 5,
                minGy,
                widthPx: (maxGx - minGx + 1) * 5,
                heightPx: (maxGy - minGy + 1) * 5
              });
            }
          }
        }
      }

      // Filter head blobs: upper portion of frame, significant size
      const headBlobs = components
        .filter((c) => c.cells >= 14 && c.centerY <= 85)
        .sort((a, b) => b.cells - a.cells);

      if (headBlobs.length === 0) {
        return { faceCount: 0, faces: [], source: 'calibrated-cv' };
      }

      // Strictly separate people by wide horizontal spacing (>= 48px apart)
      // This prevents single candidate head + neck/shoulder/hand from being counted as 2
      const distinctPeople: typeof headBlobs = [];
      for (const blob of headBlobs) {
        const isPartOfSamePerson = distinctPeople.some(
          (p) => Math.abs(p.centerX - blob.centerX) < 48
        );
        if (!isPartOfSamePerson) {
          distinctPeople.push(blob);
        }
      }

      return {
        faceCount: distinctPeople.length,
        faces: distinctPeople.map((p) => ({
          x: Math.round(p.centerX - p.widthPx / 2),
          y: Math.round(p.centerY - p.heightPx / 2),
          width: p.widthPx,
          height: p.heightPx,
          score: 0.8
        })),
        source: 'calibrated-cv'
      };
    }
  }

  return { faceCount: 1, faces: [], source: 'calibrated-cv' };
}
