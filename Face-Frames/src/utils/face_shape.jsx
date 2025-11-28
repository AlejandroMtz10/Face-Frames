import shapeData from "../Data-json/shape-face.json";

const distance = (p1, p2) =>
    Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

export function calculateFaceShape(landmarks) {
    if (!landmarks || !landmarks.positions || landmarks.positions.length < 68) {
        return "No face data available";
    }

    const pts = landmarks.positions;

    // ========== POINTS ==========
    const chinBottom = pts[8];
    const chinLeft = pts[4];
    const chinRight = pts[12];

    const browLeftOuter = pts[17];
    const browRightOuter = pts[26];

    const browLeftInner = pts[21];
    const browRightInner = pts[22];

    const cheekLeft = pts[2];
    const cheekRight = pts[14];

    const pTop = {
        x: (browLeftInner.x + browRightInner.x) / 2,
        y: (browLeftInner.y + browRightInner.y) / 2,
    };

    // ========== MEASUREMENTS ==========
    const totalHeight = distance(chinBottom, pTop);
    const jawWidth = distance(chinLeft, chinRight);
    const cheekWidth = distance(cheekLeft, cheekRight);
    const foreheadWidth = distance(browLeftOuter, browRightOuter);

    const ratio = totalHeight / cheekWidth;

    // ========== SCORING SYSTEM ==========
    const scores = {
        Oval: 0,
        Round: 0,
        Square: 0,
        Heart: 0,
        Diamond: 0,
        Oblong: 0,
    };

    // ========== OVAL ==========
    if (ratio > 1.3 && ratio < 1.55) scores.Oval++;
    if (cheekWidth > jawWidth) scores.Oval++;
    if (foreheadWidth >= cheekWidth * 0.95) scores.Oval++;

    // ========== ROUND ==========
    if (ratio >= 0.9 && ratio <= 1.2) scores.Round++;
    if (Math.abs(cheekWidth - jawWidth) <= cheekWidth * 0.10) scores.Round++;
    if (Math.abs(foreheadWidth - cheekWidth) <= cheekWidth * 0.10) scores.Round++;

    // ========== SQUARE ==========
    if (ratio >= 0.9 && ratio <= 1.2) scores.Square++;
    if (jawWidth >= cheekWidth * 0.95) scores.Square++;
    if (foreheadWidth >= cheekWidth * 0.95) scores.Square++;

    // ========== HEART ==========
    if (foreheadWidth > cheekWidth * 1.05) scores.Heart++;
    if (jawWidth < cheekWidth * 0.85) scores.Heart++;
    if (ratio > 1.2) scores.Heart++;

    // ========== DIAMOND ==========
    if (cheekWidth > foreheadWidth * 1.10) scores.Diamond++;
    if (cheekWidth > jawWidth * 1.12) scores.Diamond++;
    if (ratio >= 1.0 && ratio <= 1.4) scores.Diamond++;

    // ========== OBLONG ==========
    if (ratio > 1.45) scores.Oblong++;
    if (Math.abs(cheekWidth - foreheadWidth) <= cheekWidth * 0.10) scores.Oblong++;
    if (jawWidth < cheekWidth) scores.Oblong++;

    // ========== SELECT BEST ==========
    const bestShape = Object.keys(scores).reduce((a, b) =>
        scores[a] > scores[b] ? a : b
    );

    if (scores[bestShape] === 0) return "Inconclusive";

    return bestShape;
}

export function getFaceShapeData(shape) {
    if (!shape) return null;

    // Search in your JSON by exact name
    const result = shapeData.find((item) => item.name === shape);

    // If nothing is found
    if (!result) {
        return {
            name: shape,
            description: "No data found for this face shape.",
            glasses: [],
            pictures: [],
        };
    }

    return result;
}