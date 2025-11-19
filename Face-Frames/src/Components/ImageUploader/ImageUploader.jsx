import React, { useState } from "react";
import { analyzeFaceWithLuxand } from "../../utils/luxandApi.js";
import { calculateFaceShape, getLensRecommendation } from "../../utils/faceShape.js";

export default function ImageUploader() {
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rawResult, setRawResult] = useState(null);
    const [faceShape, setFaceShape] = useState({ shape: null, recommendation: null });
    const [error, setError] = useState(null);

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Validación de formatos comunes para la API
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(selectedFile.type)) {
            setError("Formato de archivo no compatible. Por favor, usa JPEG, PNG o WebP.");
            setFile(null);
            setPreview(null);
            return;
        }

        setFile(selectedFile);
        // Crea una URL de objeto para la vista previa de la imagen
        setPreview(URL.createObjectURL(selectedFile)); 
        setError(null);
        setRawResult(null);
        setFaceShape({ shape: null, recommendation: null });
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError("Por favor, selecciona una imagen primero.");
            return;
        }

        setLoading(true);
        setError(null);
        setRawResult(null);
        setFaceShape({ shape: null, recommendation: null });

        try {
            // Llama a la función integrada
            const apiResponse = await analyzeFaceWithLuxand(file); 
            setRawResult(apiResponse);

            // 1. EXTRA: Comprobación de que la API de Luxand devolvió 'landmarks' y que es un array con datos.
            const detectedFaces = apiResponse.landmarks;
            // Verificar el estado de éxito Y que el array 'landmarks' existe y contiene al menos un rostro
            const isFaceDetected = apiResponse.status === "success" && Array.isArray(detectedFaces) && detectedFaces.length > 0;

            if (isFaceDetected) {
                // 2. El objeto de puntos de referencia de la cara está directamente en el primer elemento del array 'landmarks'.
                const firstFaceLandmarks = detectedFaces[0]; 
                
                // 3. Pasa los puntos de referencia a la lógica de clasificación
                const shape = calculateFaceShape(firstFaceLandmarks);
                const recommendation = getLensRecommendation(shape);

                setFaceShape({ shape, recommendation });

            } else {
                // Manejo de mensajes de error específicos de la API o falta de detección
                let detectionError = "La API de Luxand no detectó rostros en la imagen. Asegúrate de que el rostro sea claro y esté bien iluminado.";

                if (apiResponse && apiResponse.status === "failure") {
                     detectionError = `Error de la API: ${apiResponse.message}`;
                } 
                
                setError(detectionError);
                setFaceShape({ shape: "N/A", recommendation: "Por favor, prueba con una imagen diferente." });
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "Ocurrió un error inesperado durante el análisis.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Analizador de Forma de Rostro</h1>
                
                <div className="bg-white rounded-xl shadow-2xl border p-6 sm:p-8">

                    {/* Sección de entrada y vista previa de imagen */}
                    <div className="flex flex-col items-center mb-6 border-b pb-6">
                        {/* Vista previa */}
                        <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 overflow-hidden mb-4 border-4 border-gray-100 shadow-inner">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Vista Previa de la Imagen"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>Selecciona una imagen</span>
                            )}
                        </div>

                        {/* Entrada de archivo */}
                        <label className="w-full sm:w-64 cursor-pointer">
                            <div className="px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl text-center hover:bg-emerald-700 transition duration-150 shadow-md">
                                Seleccionar Imagen / Tomar Foto
                            </div>
                            <input
                                type="file"
                                // Restringe los tipos de archivo
                                accept="image/jpeg, image/png, image/webp"
                                capture="environment"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>

                    {/* Botón de Análisis */}
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !file}
                        className="w-full py-3 mb-6 bg-blue-600 text-white font-extrabold text-lg rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition duration-150 shadow-lg"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analizando...
                            </div>
                        ) : (
                            "Analizar Rostro"
                        )}
                    </button>

                    {/* Sección de Resultados */}
                    <div className="space-y-4">
                        {/* Visualización de Errores */}
                        {error && (
                            <div className="bg-red-100 p-4 rounded-lg border border-red-300">
                                <p className="text-red-700 font-semibold">Error:</p>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Resultado de Forma */}
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-300">
                            <p className="text-sm font-medium text-emerald-800">Forma de Rostro Detectada:</p>
                            <p id="faceShapeResult" className="text-2xl font-bold text-emerald-700 mt-1">
                                {faceShape.shape || "--"}
                            </p>
                        </div>

                        {/* Recomendación */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-300">
                            <p className="text-sm font-medium text-blue-800">Recomendación de Gafas:</p>
                            <p id="recommendationResult" className="text-blue-700 mt-1">
                                {faceShape.recommendation || "Sube una imagen para empezar."}
                            </p>
                        </div>

                        {/* Respuesta Raw de la API (para depuración) */}
                        {rawResult && (
                            <details className="mt-4">
                                <summary className="text-gray-500 cursor-pointer text-sm">
                                    Mostrar Respuesta Raw de la API (para depuración)
                                </summary>
                                <pre className="bg-gray-100 mt-2 p-3 rounded-lg text-xs overflow-auto max-h-48">
                                    {JSON.stringify(rawResult, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}