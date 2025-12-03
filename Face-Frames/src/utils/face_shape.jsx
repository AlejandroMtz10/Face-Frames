import shapeData from "../Data-json/shape-face.json";

const DEBUG = true;

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

    // Define points and measurements 
    const chin = p[8];
    const topMid = { x: (p[21].x + p[22].x) / 2, y: (p[21].y + p[22].y) / 2 };
    const cheekLeft = p[2];
    const cheekRight = p[14]; 
    const jawLeft = p[4];
    const jawRight = p[12];
    const browLeftOuter = p[17];
    const browRightOuter = p[26];
    const faceWidth = distance(p[0], p[16]); 

    // Distances
    const faceHeight = distance(chin, topMid);
    const jawWidth = distance(jawLeft, jawRight);
    const cheekWidth = distance(cheekLeft, cheekRight);
    const foreheadWidth = distance(browLeftOuter, browRightOuter);
    
    // Normalized Ratios
    const nFaceHeight = faceHeight / faceWidth;
    const nJaw = jawWidth / faceWidth;
    const nCheek = cheekWidth / faceWidth;
    const nForehead = foreheadWidth / faceWidth;

    // Jaw angle
    const jawAngle = angleDeg(p[4], p[8], p[12]); 

    const scores = {
        Oval: 0, Round: 0, Square: 0, Heart: 0, Diamond: 0, Oblong: 0, Triangle: 0,
    };

    // Weights / thresholds
    const DOM = 0.08; // Base dominance threshold

    // =======================================================
    // 💎 DIAMOND (Dominant Cheekbones) 
    // =======================================================
    const DIAMOND_DOM_STRONG = 0.15; // Increased threshold for strong dominance
    
    // Strong dominance: Cheek > Forehead AND Cheek > Jaw
    if (nCheek > nForehead * (1 + DIAMOND_DOM_STRONG) && nCheek > nJaw * (1 + DIAMOND_DOM_STRONG)) {
        scores.Diamond += 3; 
    }
    // Check for weaker dominance (ratio > 1.20)
    if (nCheek > nForehead * 1.25) scores.Diamond += 1; // Slight increase in threshold
    if (nCheek > nJaw * 1.25) scores.Diamond += 1; // Slight increase in threshold
    
    // PENALTY for overly soft jaw
    if (jawAngle > 125) scores.Diamond -= 2; 

    // =======================================================
    // ❤️ HEART (Dominant Forehead, narrow Jaw)
    // =======================================================
    // Strong dominance: Forehead > Cheek AND Jaw < Cheek
    if (nForehead > nCheek * (1 + DOM) && nJaw < nCheek * (1 - DOM)) {
        scores.Heart += 3; 
    }
    if (nForehead > nCheek * 1.08) scores.Heart += 1; // Slight increase in threshold
    if (nJaw < nCheek * 0.9) scores.Heart += 1;

    // =======================================================
    // 🔺 TRIANGLE (Dominant Jaw, narrow Forehead)
    // =======================================================
    // Strong dominance: Jaw > Cheek AND Jaw > Forehead
    if (nJaw > nCheek * (1 + DOM) && nJaw > nForehead * (1 + DOM)) {
        scores.Triangle += 3; 
    }
    // FIX: Corrected comparison from nJaw > nJaw * 1.06 to nJaw > nCheek * 1.06
    if (nJaw > nCheek * 1.08) scores.Triangle += 1; // Slight increase in threshold

    // =======================================================
    // 📏 OBLONG (Lengthy face, nFaceHeight > 1.45)
    // =======================================================
    if (jawAngle < 112) scores.Oblong += 1;
    if (nFaceHeight > 1.55) scores.Oblong += 3; 
    if (nFaceHeight > 1.45) scores.Oblong += 2;

    // =======================================================
    // 🥚 OVAL (Balanced and Soft) 
    // =======================================================
    // Main range: Height > 1.05 and <= 1.50
    if (nFaceHeight > 1.05 && nFaceHeight <= 1.50) scores.Oval += 2; 
    if (jawAngle > 116) scores.Oval += 1; 
    
    // Boost for medium-length, soft faces (Hiface 'face_length: medium')
    if (nFaceHeight > 0.95 && nFaceHeight <= 1.05 && jawAngle > 116) scores.Oval += 1; 
    
    // Penalty if the width difference is too high (should be more angular/dominant)
    if (Math.abs(nCheek - nJaw) > 0.10 || Math.abs(nCheek - nForehead) > 0.10) scores.Oval -= 1.5; // Increased penalty

    // =======================================================
    // ⭕ ROUND (Short/Wide and Soft) 
    // =======================================================
    // Range is strictly for short faces (nFaceHeight <= 1.05).
    if (nFaceHeight >= 0.75 && nFaceHeight <= 1.05) scores.Round += 2; 
    if (jawAngle > 116 && Math.abs(nCheek - nJaw) <= 0.08) scores.Round += 1;

    // Boost for very short and very soft faces 
    if (jawAngle > 120 && nFaceHeight < 1.00) scores.Round += 1;


    // =======================================================
    // 🔲 SQUARE (Consistent Width and Angular)
    // =======================================================
    if (jawAngle < 112) scores.Square += 1; 
    if (
        // Must be extremely consistent width across all measures
        Math.abs(nJaw - nCheek) <= 0.04 && // Reduced tolerance from 0.06
        Math.abs(nForehead - nCheek) <= 0.06 && // Reduced tolerance from 0.08
        jawAngle < 112
    ) {
        scores.Square += 3; // High score for shape
    }
    if (jawAngle < 112 && Math.abs(nJaw - nCheek) <= 0.08) scores.Square += 1; // Reduced tolerance from 0.10

    // Tiebreakers
    // Only apply if the dominant feature is truly dominant
    if (nForehead > nCheek * 1.05 && nForehead > nJaw * 1.05) scores.Heart += 0.5;
    if (nJaw > nCheek * 1.05 && nJaw > nForehead * 1.05) scores.Triangle += 0.5;

    // Ensure no negative scores remain
    Object.keys(scores).forEach(key => {
        if (scores[key] < 0) scores[key] = 0;
    });

    // DEBUG print
    if (DEBUG) {
        console.log("FACE METRICS:", {
            nFaceHeight: nFaceHeight.toFixed(3), 
            nJaw: nJaw.toFixed(3), 
            nCheek: nCheek.toFixed(3), 
            nForehead: nForehead.toFixed(3), 
            jawAngle: jawAngle.toFixed(2) + "°"
        });
        console.log("FINAL SCORES:", scores);
    }

    // Pick highest score
    const winner = Object.keys(scores).reduce((a, b) =>
        scores[a] >= scores[b] ? a : b
    );
    const winningScore = scores[winner];

    // =======================================================
    // HANDLE NO-DOMINANT CASES
    // =======================================================
    // If the winning score is 2 or less, it means the face doesn't strongly match any one category.
    // The main shapes (Diamond, Heart, Square, Triangle, Oblong) all have 3 points for strong matches.
    if (winningScore < 3) { 
        // If the winner is Oval or Round, but the score is only 2, it's not a strong match.
        if (winner === "Oval" || winner === "Round") {
            return "Not Found";
        }
        
        // If the winner is a hard shape (Oblong, Diamond, Heart, Square, Triangle) but scored low (1 or 2), 
        // it means the characteristics are present but weak. We default to "Not Found" for lack of confidence.
        return "Not Found"; 
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