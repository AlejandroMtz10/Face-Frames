import shapeData from "../Data-json/shape-face.json";

const DEBUG = false; // set true to print numbers for tuning

const distance = (a, b) =>
  Math.hypot(b.x - a.x, b.y - a.y);

// angle at b formed by a-b-c (degrees)
const angleDeg = (a, b, c) => {
  const abx = a.x - b.x, aby = a.y - b.y;
  const cbx = c.x - b.x, cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const ma = Math.hypot(abx, aby);
  const mc = Math.hypot(cbx, cby);
  if (ma === 0 || mc === 0) return 180;
  const cos = Math.max(-1, Math.min(1, dot / (ma * mc)));
  return Math.acos(cos) * (180 / Math.PI);
};

export function calculateFaceShape(data) {
  if (!data?.positions || data.positions.length < 68) return "No face data available";
  const p = data.positions;

  // Robust selectors (averages / multiple points)
  const chin = p[8];
  const topMid = { // approx top using inner brows average
    x: (p[21].x + p[22].x) / 2,
    y: (p[21].y + p[22].y) / 2,
  };

  // approximate cheek "width" by averaging two symmetric pairs (2/14 and 3/13)
  const cheekLeftPts = [p[2], p[3]];
  const cheekRightPts = [p[14], p[13]];
  const cheekLeft = {
    x: (cheekLeftPts[0].x + cheekLeftPts[1].x) / 2,
    y: (cheekLeftPts[0].y + cheekLeftPts[1].y) / 2,
  };
  const cheekRight = {
    x: (cheekRightPts[0].x + cheekRightPts[1].x) / 2,
    y: (cheekRightPts[0].y + cheekRightPts[1].y) / 2,
  };

  // jaw endpoints average (4 and 12 are good)
  const jawLeft = p[4];
  const jawRight = p[12];

  // forehead approximation using brow outer ends (17 and 26)
  const browLeftOuter = p[17];
  const browRightOuter = p[26];

  // face width baseline (points 0 and 16)
  const faceWidth = distance(p[0], p[16]);

  // Distances
  const faceHeight = distance(chin, topMid);
  const jawWidth = distance(jawLeft, jawRight);
  const cheekWidth = distance(cheekLeft, cheekRight);
  const foreheadWidth = distance(browLeftOuter, browRightOuter);

  // Normalize by faceWidth to reduce scale/camera effects
  const nFaceHeight = faceHeight / faceWidth;
  const nJaw = jawWidth / faceWidth;
  const nCheek = cheekWidth / faceWidth;
  const nForehead = foreheadWidth / faceWidth;

  // jaw angle (soft vs angular)
  const jawAngle = angleDeg(p[4], p[8], p[12]); // angle at chin using jaw points

  // scores object
  const scores = {
    Oval: 0,
    Round: 0,
    Square: 0,
    Heart: 0,
    Diamond: 0,
    Oblong: 0,
    Triangle: 0, // jaw-dominant (optional)
  };

  // Weights / thresholds (tunable)
  // NOTE: thresholds are normalized (faceWidth = 1)
  // Dominance thresholds require at least 8% difference to count
  const DOM = 0.08;

  // --------------------------------------------------
  // Diamond: cheek >> forehead AND cheek >> jaw
  if (nCheek > nForehead * (1 + DOM) && nCheek > nJaw * (1 + DOM)) {
    scores.Diamond += 3;
  }
  if (nCheek > nForehead * 1.06) scores.Diamond += 1;
  if (nCheek > nJaw * 1.06) scores.Diamond += 1;

  // --------------------------------------------------
  // Heart: forehead dominant & narrow jaw
  if (nForehead > nCheek * (1 + DOM) && nJaw < nCheek * (1 - DOM)) {
    scores.Heart += 3;
  }
  if (nForehead > nCheek * 1.06) scores.Heart += 1;
  if (nJaw < nCheek * 0.9) scores.Heart += 1;

  // --------------------------------------------------
  // Triangle (jaw dominant)
  if (nJaw > nCheek * (1 + DOM) && nJaw > nForehead * (1 + DOM)) {
    scores.Triangle += 3;
  }
  if (nJaw > nCheek * 1.06) scores.Triangle += 1;

  // --------------------------------------------------
  // Oblong: height significantly larger than width
  if (nFaceHeight > 1.55) scores.Oblong += 3;
  if (nFaceHeight > 1.45) scores.Oblong += 1;

  // --------------------------------------------------
  // Oval: medium-high height and soft jaw
  if (nFaceHeight > 1.30 && nFaceHeight <= 1.55) scores.Oval += 2;
  if (jawAngle > 116) scores.Oval += 1; // softer jaw adds to oval

  // --------------------------------------------------
  // Round: height ~ width and soft jaw
  if (nFaceHeight >= 0.95 && nFaceHeight <= 1.25) scores.Round += 2;
  if (jawAngle > 116 && Math.abs(nCheek - nJaw) <= 0.08) scores.Round += 1;

  // --------------------------------------------------
  // Square: width similar across forehead/cheek/jaw and jaw angle sharp
  if (
    Math.abs(nJaw - nCheek) <= 0.06 &&
    Math.abs(nForehead - nCheek) <= 0.08 &&
    jawAngle < 112
  ) {
    scores.Square += 3;
  }
  if (jawAngle < 112 && Math.abs(nJaw - nCheek) <= 0.10) scores.Square += 1;

  // --------------------------------------------------
  // Tiebreakers & small bonuses
  if (nCheek > nJaw && nCheek > nForehead) scores.Diamond += 0.5;
  if (nForehead > nCheek && nForehead > nJaw) scores.Heart += 0.5;
  if (nJaw > nCheek && nJaw > nForehead) scores.Triangle += 0.5;

  // DEBUG print
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log("face metrics (normalized):", {
      nFaceHeight, nJaw, nCheek, nForehead, jawAngle, scores
    });
  }

  // Pick highest score
  const winner = Object.keys(scores).reduce((a, b) =>
    scores[a] >= scores[b] ? a : b
  );

  // final safety: if winner has 0 score -> fallback by ratio
  if (scores[winner] === 0) {
    if (nFaceHeight > 1.45) return "Oval";
    if (nFaceHeight < 1.15) return "Round";
    return "Inconclusive";
  }

  return winner;
}

export function getFaceShapeData(shape) {
  if (!shape) return null;
  const res = shapeData.find((s) => s.name === shape);
  if (!res) return {
    name: shape,
    description: "No data found.",
    glasses: [],
    pictures: []
  };
  return res;
}
