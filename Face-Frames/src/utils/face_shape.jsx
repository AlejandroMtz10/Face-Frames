import shapeData from "../Data-json/shape-face.json";

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Convert numeric rank array → similarity score
function compareRankings(user, ref) {
    let score = 0;
    for (let i = 0; i < 4; i++) {
        if (user[i] === ref[i]) score += 2;      // exact match
        else if (Math.abs(user[i] - ref[i]) === 1) score += 1; // close ranking
    }
    return score;
}

export function calculateFaceShape({ positions }) {
    if (!positions || positions.length < 68) return "Not Found";

    const p = positions;

    // =============================================================
    // 1. TRUE MEASUREMENTS (based on the table)
    // =============================================================

    // Frente → anchura de cejas
    const forehead = dist(p[17], p[26]);

    // Pómulos
    const cheekbones = dist(p[2], p[14]);

    // Mandíbula → desde barbilla (8) a cada lado
    const jawLeft = dist(p[8], p[4]);
    const jawRight = dist(p[8], p[12]);
    const jaw = (jawLeft + jawRight) / 2;

    const browMid = {
        x: p[27].x,
        y: p[27].y
    };

    const height = dist(p[8], browMid);

    // =============================================================
    // 2. BUILD USER RANKING (1 = biggest)
    // =============================================================
    const rawValues = [
        forehead,
        cheekbones,
        jaw,
        height
    ];

    // sorted copy (descending)
    //const sorted = [...rawValues].sort((a, b) => b - a);

    // Convert real distances → ranking 1–4
    const userRank = generateRanking(rawValues);


    // =============================================================
    // 3. FACE-SHAPE REFERENCE RANKINGS (YOUR TABLE)
    // =============================================================
    const ref = {
        Square:       [1, 1, 1, 1],
        Rectangular:  [2, 2, 2, 1],
        Oval:         [2, 2, 3, 1],
        Diamond:      [3, 2, 4, 1],
        Round:        [2, 1, 2, 1],
        Triangle:     [3, 2, 1, 3],
        Heart:        [1, 2, 2, 3]
    };

    // =============================================================
    // 4. FIND WHICH SHAPE MATCHES BEST
    // =============================================================
    let bestShape = "Not Found";
    let bestScore = -1;

    for (const shape in ref) {
        const score = compareRankings(userRank, ref[shape]);
        if (score > bestScore) {
            bestScore = score;
            bestShape = shape;
        }
    }

    // If match is too weak → unknown
    if (bestScore < 4) return "Not Found";

    return bestShape;
}

function generateRanking(values) {
    const sorted = [...values].sort((a, b) => b - a);
    return values.map(v => sorted.indexOf(v) + 1);
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