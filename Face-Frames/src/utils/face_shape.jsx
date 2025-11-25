const distance = (p1, p2) =>
    Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

export function calculateFaceShape(landmarksData) {
    if (!landmarksData?.positions || landmarksData.positions.length < 68) {
        return "No face data available";
    }

    const pts = landmarksData.positions; 

    // Mapeo de Puntos (correcto)
    const chinBottom = pts[8];
    const chinLeft = pts[4];
    const chinRight = pts[12];
    const cheekLeft = pts[2];
    const cheekRight = pts[14];
    const browLeftOuter = pts[17];
    const browRightOuter = pts[26];
    const browLeftInner = pts[21];
    const browRightInner = pts[22];
    const noseLeft = pts[31];
    const noseRight = pts[35];
    const mouthLeft = pts[48];
    const mouthRight = pts[54];

    // Punto alto medio (entre cejas)
    const pTop = {
        x: (browLeftInner.x + browRightInner.x) / 2,
        y: (browLeftInner.y + browRightInner.y) / 2
    };

    // ========== Medidas ==========
    const totalHeight = distance(chinBottom, pTop);
    const jawWidth = distance(chinLeft, chinRight);
    const cheekWidth = distance(cheekLeft, cheekRight);
    const foreheadWidth = distance(browLeftOuter, browRightOuter);
    const mouthWidth = distance(mouthLeft, mouthRight);
    const noseWidth = distance(noseLeft, noseRight);

    const ratio = totalHeight / cheekWidth;

    // ========== Sistema de puntaje ==========
    const scores = {
        Oval: 0, Square: 0, Round: 0,
        Heart: 0, Oblong: 0, Diamond: 0
    };

    // ==================== ARBOL DE DECISION REFINADO ====================
    
    // Nivel 1: Proporción Larga/Ancho (El criterio más importante)
    // ---------------------------------------------------------------
    if (ratio > 1.45) {
        scores.Oblong += 5; // Muy largo
    } else if (ratio > 1.35) {
        scores.Oval += 4;   // Ligeramente más largo que ancho
    } else if (ratio >= 0.90) { // Si no es Oval o Oblong, es Round/Square (ratio <= 1.35)
        scores.Round += 4;
    }

    // Nivel 2: Mandíbula vs. Pómulos
    // ---------------------------------------------------------------
    // Cuadrado/Rectangular: Mandíbula y pómulos de ancho similar
    if (jawWidth >= cheekWidth * 0.90) { // 90% del ancho del pómulo
        scores.Square += 3;
    } 
    // Corazón/Triángulo Invertido: Mandíbula estrecha
    else if (jawWidth < cheekWidth * 0.85) { // Mandíbula estrecha (usamos 85% para no chocar con el 90%)
        scores.Heart += 3;
    }
    
    // Si la mandíbula es solo ligeramente más estrecha (85% - 90%), favorece Oval/Round

    // Nivel 3: Frente vs. Pómulos (Diamond/Heart)
    // ---------------------------------------------------------------
    // Diamante: Pómulos significativamente más anchos que la frente.
    if (cheekWidth > foreheadWidth * 1.15) { 
        scores.Diamond += 2; 
    } 
    // Corazón: Frente significativamente más ancha que los pómulos.
    if (foreheadWidth > cheekWidth * 1.10) {
        scores.Heart += 1;
    }

    // Nivel 4: Nariz vs boca (característico de diamante)
    // ---------------------------------------------------------------
    if (noseWidth < mouthWidth * 0.85) {
        scores.Diamond += 1;
    }
    
    // Nivel 5: Refuerzo para Cuadrado (Ángulos)
    // ---------------------------------------------------------------
    // Usamos esta regla para reforzar la detección de "Square" en los casos borderline (ya que no podemos medir ángulos)
    const cheeksEqualJaw = Math.abs(cheekWidth - jawWidth) < cheekWidth * 0.05; // Más estricto: 5%
    if (cheeksEqualJaw) {
        scores.Square += 1;
    }


    // ========== Elegir el de mayor puntaje ==========
    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

export function getLensRecommendation(shape) {
    switch (shape) {
        case "Oval":
            return "La forma ideal. Casi cualquier montura funciona.";
        case "Round":
            return "Monturas cuadradas o rectangulares para añadir ángulos.";
        case "Square":
            return "Monturas redondas u ovaladas para suavizar la mandíbula.";
        case "Heart":
            return "Monturas más anchas en la parte inferior o estilo aviador.";
        case "Oblong":
            return "Monturas grandes o gruesas para acortar el rostro.";
        case "Diamond":
            return "Monturas ovaladas o cat-eye para acentuar pómulos.";
        default:
            return "Prueba monturas medianas y proporcionales.";
    }
}