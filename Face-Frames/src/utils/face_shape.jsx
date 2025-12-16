import shapeData from "../Data-json/shape-face.json";

const TOLERANCE_FACTOR = 0.07; // 7% difference to consider measurements similar

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Generates a similarity ranking based on relative values.
 * Similar values (within tolerance) share the same rank.
 */
function generateSimilarityRanking(values) {
    const indexed = values.map((value, index) => ({ value, index }));
    indexed.sort((a, b) => b.value - a.value);

    const ranks = new Array(values.length).fill(0);
    let currentRank = 1;

    for (let i = 0; i < indexed.length; i++) {
        const { value, index } = indexed[i];

        if (i === 0) {
            ranks[index] = currentRank;
        } else {
            const prevValue = indexed[i - 1].value;
            const relativeDiff = Math.abs(value - prevValue) / prevValue;

        if (relativeDiff <= TOLERANCE_FACTOR) {
            ranks[index] = currentRank;
        } else {
            currentRank = i + 1;
            ranks[index] = currentRank;
        }
        }
    }

    return ranks.map((r) => Math.min(r, 4));
}

/**
 * Compares two ranking arrays and returns a similarity score.
 */
function compareRankings(userRank, referenceRank) {
    let score = 0;

    for (let i = 0; i < 4; i++) {
        if (userRank[i] === referenceRank[i]) score += 2;
        else if (Math.abs(userRank[i] - referenceRank[i]) === 1) score += 1;
    }

    return score;
}

/**
 * Main face shape calculation using MediaPipe 468 landmarks.
 */
export function calculateFaceShape({ positions }) {
    if (!positions || positions.length < 468) {
        return { shape: "Not Found", accuracy: 0 };
    }

    const p = positions;

    // Measurements based on MediaPipe landmark indices
    const foreheadWidth = distance(p[103], p[332]);
    const cheekboneWidth = distance(p[127], p[356]);

    const chin = p[152];
    const jawLeft = distance(chin, p[58]);
    const jawRight = distance(chin, p[288]);
    const jawWidth = (jawLeft + jawRight) / 2;

    const faceHeight = distance(chin, p[10]);

    const measurements = [
        foreheadWidth,
        cheekboneWidth,
        jawWidth,
        faceHeight,
    ];

    const userRanking = generateSimilarityRanking(measurements);

    const referenceRanks = {
        Square: [1, 1, 1, 1],
        Rectangular: [2, 2, 2, 1],
        Oval: [2, 2, 3, 1],
        Diamond: [3, 2, 4, 1],
        Round: [2, 1, 2, 1],
        Triangle: [3, 2, 1, 3],
        Heart: [1, 2, 2, 3],
    };

    let bestShape = "Not Found";
    let bestScore = -1;

    for (const shape in referenceRanks) {
        const score = compareRankings(userRanking, referenceRanks[shape]);
        if (score > bestScore) {
        bestScore = score;
        bestShape = shape;
        }
    }

    const accuracy = Math.round((bestScore / 8) * 100);

    if (bestScore < 5) {
        return { shape: "Not Found", accuracy };
    }

    return { shape: bestShape, accuracy };
    }

    /**
     * Returns descriptive data for a detected face shape.
     */
    export function getFaceShapeData(shape) {
    if (!shape) return null;

    const result = shapeData.find((item) => item.name === shape);

    if (!result) {
        return {
        name: shape,
        description: "No data found.",
        glasses: [],
        pictures: [],
        };
    }

    return result;
}
