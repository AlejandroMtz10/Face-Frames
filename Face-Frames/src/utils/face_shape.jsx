import shapeData from "../Data-json/shape-face.json";

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Comparación de rankings (1 = más grande)
function compareRankings(user, ref) {
    let score = 0;
    for (let i = 0; i < 4; i++) {
        if (user[i] === ref[i]) score += 2; 
        else if (Math.abs(user[i] - ref[i]) === 1) score += 1;
    }
    return score;
}

export function calculateFaceShape({ positions }) {
    if (!positions || positions.length < 68) return "Not Found";

    const p = positions;

    const forehead = dist(p[19], p[24]);  // frente real
    const cheekbones = dist(p[1], p[15]); // pómulos reales
    const jaw = dist(p[5], p[11]);        // mandíbula real
    const height = dist(p[8], p[27]);     // altura del rostro

    const rawValues = [forehead, cheekbones, jaw, height];

    const sorted = [...rawValues].sort((a, b) => b - a); // Descendente
    const userRank = rawValues.map(v => sorted.indexOf(v) + 1);

    // TABLA ORIGINAL EXACTA
    const ref = {
        Square:      [1, 1, 1, 1],
        Rectangular: [2, 2, 2, 1],
        Oval:        [2, 2, 3, 1],
        Diamond:     [3, 2, 4, 1],
        Round:       [2, 1, 2, 1],
        Triangle:    [3, 2, 1, 3],
        Heart:       [1, 2, 2, 3]
    };

    let bestShape = "Not Found";
    let bestScore = -1;

    for (const shape in ref) {
        const score = compareRankings(userRank, ref[shape]);
        if (score > bestScore) {
            bestScore = score;
            bestShape = shape;
        }
    }

    if (bestScore < 4) return "Not Found";

    return bestShape;
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