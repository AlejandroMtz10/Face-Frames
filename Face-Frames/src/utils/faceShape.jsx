const distance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};
/**
 * Determina la forma de la cara basándose en las medidas clave de los puntos de referencia.
 * @param {object} landmarks - El objeto 'face' que contiene todos los puntos de referencia de Luxand.
 * @returns {string} La forma de la cara determinada.
 */
export function calculateFaceShape(landmarks) {
    // La comprobación inicial debe asegurar que tenemos la estructura mínima necesaria
    if (!landmarks || !landmarks.face_contour || !landmarks.chin || !landmarks.left_eyebrow || !landmarks.right_eyebrow) {
        return "No face data available";
    }

    const face = landmarks;

    // Puntos clave para la medición basados en la estructura de Luxand
    const chinBottom = face.chin.bottom;
    const chinLeft = face.chin.left;
    const chinRight = face.chin.right;

    const browLeftOuter = face.left_eyebrow.outer_corner;
    const browRightOuter = face.right_eyebrow.outer_corner;
    const browLeftInner = face.left_eyebrow.inner_corner;
    const browRightInner = face.right_eyebrow.inner_corner;

    // Puntos utilizados para el ancho máximo de la mejilla (puntos del contorno 14 y 15)
    // NOTA: Los puntos 14 y 15 son solo ejemplos. Usaremos los puntos más anchos del contorno para mayor precisión.
    // Usaremos los puntos definidos en el código anterior que son adecuados para el contorno.
    const cheekLeft = face.face_contour.point14;
    const cheekRight = face.face_contour.point15;

    // Punto superior aproximado para la medición de la altura total
    const pTop = {
        x: (browLeftInner.x + browRightInner.x) / 2,
        y: (browLeftInner.y + browRightInner.y) / 2,
    };

    // Medidas geométricas
    const totalHeight = distance(chinBottom, pTop);
    const jawWidth = distance(chinLeft, chinRight);
    const cheekWidth = distance(cheekLeft, cheekRight);
    const foreheadWidth = distance(browLeftOuter, browRightOuter);

    const ratio = totalHeight / cheekWidth;

    // --- Lógica de Clasificación ---
    // [Image of face shapes chart]
    
    // Óvalo (Oval): Altura > Ancho, Mandíbula < Pómulos, Barbilla Redondeada. Es la forma ideal (ratio > 1.3)
    if (ratio > 1.3 && jawWidth < cheekWidth) return "Oval";
    
    // Cuadrada/Redonda (Square/Round): Altura ≈ Ancho (ratio cerca de 1)
    if (ratio >= 0.9 && ratio <= 1.2) {
        // Cuadrada (Square): Mandíbula ≈ Pómulos ≈ Frente
        if (jawWidth >= cheekWidth * 0.95 && foreheadWidth >= cheekWidth * 0.9) return "Square"; 
        // Redonda (Round): Pómulos anchos, Mandíbula/Frente más estrechas, Suave.
        return "Round";
    }

    // Corazón (Heart): Frente > Pómulos > Mandíbula estrecha/puntiaguda.
    if (foreheadWidth > cheekWidth && jawWidth < cheekWidth * 0.8) return "Heart";
    
    // Alargada (Oblong/Long): Mucho más larga que ancha (ratio > 1.4)
    if (ratio > 1.4 && jawWidth < cheekWidth * 0.95) return "Oblong (Long)";
    
    // Diamante (Diamond): Pómulos muy anchos > Frente estrecha > Mandíbula estrecha.
    if (cheekWidth > foreheadWidth && cheekWidth > jawWidth) return "Diamond";

    return "Other / Inconclusive";
}

/**
 * Proporciona recomendaciones de estilo de lentes basadas en la forma de la cara determinada.
 * @param {string} shape - La forma de la cara determinada.
 * @returns {string} El texto de la recomendación.
 */
export function getLensRecommendation(shape) {
    switch (shape) {
        case "Oval":
            return "La forma ideal. Puedes usar casi cualquier montura, pero los estilos **Aviador** y **Rectangulares** anchos mantienen un equilibrio perfecto.";
        case "Round":
            return "Elige monturas **Cuadradas** o **Rectangulares** para añadir ángulos, alargar el rostro y proporcionar definición.";
        case "Square":
            return "Busca monturas **Redondas** u **Ovaladas** para suavizar los ángulos fuertes de la mandíbula y la frente.";
        case "Heart":
            return "Las monturas que son más anchas en la parte inferior o tienen un acento visual en la parte inferior (como **Aviador** o sin montura) ayudan a equilibrar la barbilla estrecha.";
        case "Oblong (Long)":
            return "Las monturas grandes, **Gruesas (Wayfarer)** o de puente bajo ayudan a acortar visualmente la longitud del rostro.";
        case "Diamond":
            return "Las monturas **Ovaladas** o **Cat-Eye** son excelentes para acentuar los pómulos altos y suavizar la línea de los ojos.";
        default:
            return "Recomendación estándar: Prueba monturas medianas y proporcionales.";
    }
}