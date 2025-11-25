import React, { useState, useCallback, useRef, useEffect } from "react";
import { calculateFaceShape, getLensRecommendation } from "../../utils/face_shape.jsx";
import { FiUploadCloud } from "react-icons/fi";
import { TbLoader2 } from "react-icons/tb";

import * as faceapi from "face-api.js";

const MODEL_URL = "/models";

export default function ImageUploader() {
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [faceShape, setFaceShape] = useState({ shape: null, recommendation: null });
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const imageRef = useRef(null);

    // Cargar modelos SOLO una vez
    useEffect(() => {
        const loadModels = async () => {
            setLoading(true);

            try {
                // SOLO los modelos que tú tienes descargados
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

                console.log("Modelos tiny + landmarks cargados correctamente");
                setModelsLoaded(true);
            } catch (err) {
                console.error("Error al cargar modelos:", err);
                setError("No se pudieron cargar los modelos. Verifica /public/models.");
            } finally {
                setLoading(false);
            }
        };

        loadModels();
    }, []);

    const processFile = useCallback((selectedFile) => {
        if (!selectedFile) return;

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(selectedFile.type)) {
            setError("Formato de archivo no compatible.");
            setPreview(null);
            return;
        }

        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setError(null);
        setFaceShape({ shape: null, recommendation: null });
    }, []);

    const handleImageChange = (e) => {
        processFile(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        processFile(e.dataTransfer.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    // ANALIZAR ROSTRO
    const handleAnalyze = async () => {
        if (!file || !imageRef.current) {
            return setError("Selecciona una imagen primero.");
        }

        if (!modelsLoaded) {
            return setError("Los modelos aún se están cargando.");
        }

        setLoading(true);
        setError(null);

        try {
            await new Promise((resolve) => {
                if (imageRef.current.complete) resolve();
                else imageRef.current.onload = resolve;
            });
            
            // Usar la imagen del DOM
            const imageElement = imageRef.current; 

            // 🔵 DETECCIÓN Y LANDMARKS
            // Usamos un inputSize más grande para mejor detección si es necesario, pero 416 está bien.
            const detections = await faceapi
                .detectAllFaces(
                    imageElement,
                    new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
                )
                .withFaceLandmarks();

            if (!detections.length) {
                setError("No se detectó ningún rostro en la imagen.");
                return;
            }

            // Mapeamos los puntos para tener solo el array de {x, y}
            const positions = detections[0].landmarks.positions.map((p) => ({
                x: p.x,
                y: p.y,
            }));

            // 🌟 ESTE ES EL CAMBIO CLAVE 🌟: 
            // Crear el objeto que la función calculateFaceShape espera: { positions: [...] }
            const landmarksDataForCalc = { positions: positions };

            const shape = calculateFaceShape(landmarksDataForCalc);
            const recommendation = getLensRecommendation(shape);

            setFaceShape({ shape, recommendation });
            
            if (shape === "No face data available") {
                setError("Error: No se obtuvieron los 68 puntos faciales para el cálculo. Intenta con una imagen más clara y frontal.");
            }

        } catch (err) {
            console.error("Error durante el análisis:", err);
            setError("Error interno durante el análisis del rostro.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center p-4 font-sans w-full">
            <div className="w-full max-w-2xl">
                <div className="bg-white dark:bg-emerald-900 rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-200">

                    {preview && (
                        <img
                            ref={imageRef}
                            src={preview}
                            alt="analyze"
                            crossOrigin="anonymous"
                            className="absolute opacity-0 pointer-events-none w-px h-px" // <-- Aquí
                        />
                    )}

                    {/* Área de carga */}
                    <div className="mb-8 flex flex-col items-center">
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`w-full p-10 mb-4 rounded-xl border-2 border-dashed transition ${
                                isDragging ? "border-blue-500 bg-indigo-50" : "border-gray-300"
                            } cursor-pointer`}
                        >
                            <label htmlFor="file-upload" className="flex flex-col items-center">
                                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4 border-2 border-gray-300 shadow-inner">
                                    {preview ? (
                                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <FiUploadCloud className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>

                                <p className="text-gray-700 dark:text-white text-lg font-semibold">
                                    {preview ? "Imagen Seleccionada" : "Haz clic o arrastra una imagen"}
                                </p>
                            </label>

                            <input
                                id="file-upload"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    {/* Botón de análisis */}
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !file || !modelsLoaded}
                        className="w-full py-3 mb-6 bg-blue-600 text-white font-extrabold text-lg rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition shadow-lg"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <TbLoader2 className="h-5 w-5 animate-spin mr-2" />
                                Procesando...
                            </span>
                        ) : (
                            "Analizar Rostro"
                        )}
                    </button>

                    {/* Resultado */}
                    {error && (
                        <div className="bg-red-100 p-4 rounded-lg border border-red-300 mb-4">
                            <p className="text-red-700 font-semibold">{error}</p>
                        </div>
                    )}

                    <div className="bg-emerald-50 p-4 rounded-lg mb-4">
                        <p className="text-sm font-medium text-emerald-800">Forma Detectada:</p>
                        <p className="text-2xl font-bold text-emerald-700">{faceShape.shape || "--"}</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Recomendación:</p>
                        <p className="text-blue-700">{faceShape.recommendation || "Sube una imagen para empezar."}</p>
                    </div>

                </div>
            </div>
        </div>
    );
}