import shapeData from "../Data-json/shape-face.json";

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export function calculateFaceShape({ positions }) {
  // Validate input
  if (!positions || positions.length < 468) {
    console.warn("MediaPipe no envió suficientes puntos.");
    return { shape: "Not Found", accuracy: 0 };
  }

  const p = positions;

  // Measurements
  const cheekboneWidth = distance(p[234], p[454]); // Points at cheekbones
  const jawWidth = distance(p[172], p[397]);      // Jaw width
  const foreheadWidth = distance(p[109], p[338]); // Forehead width
  const faceHeight = distance(p[152], p[10]);     // Chin to top of forehead

  // Ratios
  const heightToWidth = faceHeight / cheekboneWidth;
  const jawToCheek = jawWidth / cheekboneWidth;
  const foreheadToCheek = foreheadWidth / cheekboneWidth;

  // Debugging logs
  console.log("Ratios calculados:", { heightToWidth, jawToCheek, foreheadToCheek });

  const models = {
    Round:       { h: 1.1,  j: 0.88, f: 0.90 },
    Square:      { h: 1.1,  j: 0.98, f: 1.00 },
    Oval:        { h: 1.4,  j: 0.82, f: 0.88 },
    Rectangular: { h: 1.6,  j: 0.92, f: 0.92 },
    Heart:       { h: 1.25, j: 0.70, f: 1.05 },
    Diamond:     { h: 1.35, j: 0.70, f: 0.80 },
    Triangle:    { h: 1.2,  j: 1.05, f: 0.80 },
  };

  const scores = {};

  for (const shape in models) {
    const m = models[shape];
    const diff =
      Math.abs(heightToWidth - m.h) +
      Math.abs(jawToCheek - m.j) +
      Math.abs(foreheadToCheek - m.f);

    // Scoring softened to allow more ambiguity
    scores[shape] = clamp(100 - diff * 80, 0, 100);
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [bestShape, bestScore] = sorted[0];
  const [, secondScore] = sorted[1];

  // RELAJACIÓN DE UMBRALES:
  if (bestScore < 40 || (bestScore - secondScore < 2)) {
    console.log("Resultado ambiguo o bajo puntaje:", { bestScore, secondScore });
    if (bestScore > 0) return { shape: bestShape, accuracy: bestScore, scores };
    return { shape: "Not Found", accuracy: bestScore, scores };
  }

  return {
    shape: bestShape,
    accuracy: Math.round(clamp(bestScore, 55, 98)),
    scores,
  };
}

export function getFaceShapeData(shape) {
  if (!shape) return null;

  return (
    shapeData.find((s) => s.name === shape) || {
      name: shape,
      description: "No data found.",
      glasses: [],
      pictures: [],
    }
  );
}