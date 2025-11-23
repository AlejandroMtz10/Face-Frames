// Basic face shape classification using 68 facial landmarks

// Returns Euclidean distance between two points
function dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function calculateFaceShape(landmarks) {
    if (!landmarks || landmarks.length < 68) return "Unknown";

    const jawLeft = landmarks[4];
    const jawRight = landmarks[12];
    const cheekLeft = landmarks[2];
    const cheekRight = landmarks[14];
    const foreheadLeft = landmarks[19];
    const foreheadRight = landmarks[24];
    const chin = landmarks[8];
    const top = landmarks[27];

    const jawWidth = dist(jawLeft, jawRight);
    const cheekWidth = dist(cheekLeft, cheekRight);
    const foreheadWidth = dist(foreheadLeft, foreheadRight);
    const faceHeight = dist(chin, top);

    const jw = jawWidth / faceHeight;
    const cw = cheekWidth / faceHeight;
    const fw = foreheadWidth / faceHeight;
    const ratio = faceHeight / foreheadWidth;

    // Key new metric
    const faceRatio = faceHeight / cheekWidth;

    // Jaw curvature check
    const jawCurve =
        dist(landmarks[6], landmarks[8]) + dist(landmarks[10], landmarks[8]);

    // --- Heart ---
    if (fw > cw && fw > jw) return "Heart";

    // --- Square ---
    if (Math.abs(jw - fw) < 0.05 && Math.abs(fw - cw) < 0.05)
        return "Square";

    // --- Diamond ---
    if (cw > fw && jw < fw * 0.9)
        return "Diamond";

    // --- Round vs Oval (improved) ---
    if (cw > fw && cw > jw) {
        if (faceRatio <= 1.25 && jawCurve <= cheekWidth * 1.05)
            return "Round";     // short face + soft jaw
        if (faceRatio > 1.25)
            return "Oval";      // elongated face
    }

    if (ratio > 1.5) return "Oval";
    else if (ratio > 1.3) return "Oblong/Large";
    else if (ratio > 1.1) return "Square";
    else return "Round";
}


// Eyeglass recommendations based on face shape
export function getLensRecommendation(shape) {
    switch (shape) {
        case "Round":
            return "Choose angular or rectangular frames to add definition.";
        case "Oval":
            return "Most frame styles work well. Try rectangular or cat-eye frames.";
        case "Square":
            return "Use round or oval frames to soften the jawline.";
        case "Heart":
            return "Choose frames wider at the bottom or aviator styles.";
        case "Diamond":
            return "Oval, rimless, or cat-eye frames help balance cheekbones.";
        default:
            return "Upload an image to get a personalized recommendation.";
    }
}